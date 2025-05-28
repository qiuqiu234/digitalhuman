'use client'

import { useRef, useState, useEffect } from "react";

type State = "idle" | "listening" | "wakeup";

export default function VoiceWakeupIndicator({ onWakeup }: { onWakeup: () => void }) {
  const [state, setState] = useState<State>("idle");
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 新增

  // 启动语音检测
  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("当前浏览器不支持语音识别");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;

    recognition.onstart = () => setState("listening");

    recognition.onend = () => {
      setState("idle");
      // 如果不是被唤醒后主动 stop 的，则自动重启
      if (state !== "wakeup") {
        // 防止被10秒重启逻辑、点击手动重启等重复调用
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          startRecognition();
        }, 300); // 小延迟避免递归
      }
    };
    recognition.onerror = () => setState("idle");

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript.includes("你好")) {
            setState("wakeup");
            recognition.stop();
            console.log("唤醒事件已触发");
            onWakeup();  // 唤醒后调用
            // 5秒后重新开始检测
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setState("idle");
              startRecognition();
            }, 52000); // 5.2秒
          }
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // 重新开始检测
  const handleClick = () => {
    if (state === "wakeup" || state === "idle") {
      setState("idle");
      startRecognition();
    }
  };

  useEffect(() => {
    // 页面加载自动开始检测
    startRecognition();
    return () => {
      recognitionRef.current?.stop?.();
    };
    // eslint-disable-next-line
  }, []);

  // UI 显示
  let color = "bg-gray-400";
  let tooltip = "未检测";
  if (state === "listening") {
    color = "bg-green-500 animate-pulse";
    tooltip = "正在监听唤醒词";
  } else if (state === "wakeup") {
    color = "bg-red-500";
    tooltip = "已唤醒，点击重新检测";
  }
  
  return (
    <div
      className={`fixed top-6 right-8 z-50 cursor-pointer transition-all`}
      title={tooltip}
      onClick={handleClick}
      style={{ width: 28, height: 28 }}
    >
      <div className={`rounded-full border-2 border-black shadow ${color}`} style={{ width: 28, height: 28 }} />
    </div>
  );
}