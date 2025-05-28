# -*- coding: utf-8 -*-
'''
@File    :   engineBase.py
@Author  :   一力辉 
'''

from typing import List, Optional, Union
from yacs.config import CfgNode as CN
from abc import ABCMeta, abstractmethod
from digitalHuman.utils import BaseMessage

__all__ = ["BaseEngine"]

class BaseEngine(metaclass=ABCMeta):
    def __init__(self, config: CN):
        self.cfg = config
        for key in self.checkKeys():
            if key not in self.cfg:
                raise KeyError(f"[{self.__class__.__name__}] {key} is not in config")
        self.setup()
    
    def __del__(self):
        self.release()
    
    @property
    def name(self) -> str:
        return self.cfg.NAME
    
    def parameters(self) -> List[str]:
        return self.cfg.PARAMETERS if "PARAMETERS" in self.cfg else []
    
    def setup(self):
        pass

    def release(self):
        pass

    def checkKeys(self) -> List[str]:
        return []

    @abstractmethod
    async def run(self, input: Union[BaseMessage, List[BaseMessage]], **kwargs) -> Optional[BaseMessage]:
        pass