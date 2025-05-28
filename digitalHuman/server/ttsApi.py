# -*- coding: utf-8 -*-
'''
@File    :   ttsApi.py
@Author  :   一力辉 
'''

from .reponse import BaseResponse, Response
import base64
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from digitalHuman.utils import config, filterUnreadble
from digitalHuman.utils import TextMessage, AudioMessage, AudioFormatType
from digitalHuman.engine import EnginePool, EngineType

router = APIRouter()
enginePool = EnginePool()

class InferIn(BaseModel):
    engine: Optional[str] = config.SERVER.ENGINES.TTS.DEFAULT
    data: str
    settings: dict = {}

class InferOut(BaseResponse):
    data: Optional[str] = None
    format: str = ""
    sampleRate: int = 0
    sampleWidth: int = 0


@router.post("/v0/infer", response_model=InferOut, summary="Text To Speech Inference")
async def apiInfer(item: InferIn):
    if item.engine.lower() == "default":
        item.engine = config.SERVER.ENGINES.TTS.DEFAULT
    response = Response()
    try:
        input = TextMessage(data=filterUnreadble(item.data))
        output: Optional[AudioMessage] = await enginePool.getEngine(EngineType.TTS, item.engine).run(input, **item.settings)
        if output is None:
            raise RuntimeError("TTS engine run failed")
        response.data = base64.b64encode(output.data).decode('utf-8')
        response.format = str(output.format)
        response.sampleRate = output.sampleRate
        response.sampleWidth = output.sampleWidth
    except Exception as e:
        response.data = None
        response.error(str(e))
    return JSONResponse(content=response.validate(InferOut), status_code=200)