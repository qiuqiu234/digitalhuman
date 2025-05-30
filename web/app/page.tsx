"use client"


import Live2d from "./ui/home/live2d";


import { useEffect,useRef } from "react";
import Chatbot,{ ChatbotRef } from "./ui/home/chatbot";
import { InteractionMode, useInteractionModeStore, useAgentModeStore, useAgentEngineSettingsStore } from "./lib/store";

import VoiceWakeupIndicator from "./ui/common/header/VoiceWakeupIndicator";


export default function Home() {
  const interactionMode = useInteractionModeStore((state) => state.mode)
  const { fetchDefaultAgent } = useAgentModeStore();
  const { fetchAgentSettings } = useAgentEngineSettingsStore();
  const showCharacter = interactionMode != InteractionMode.CHATBOT;
  const showChatbot = interactionMode != InteractionMode.IMMERSIVE;

  const chatbotRef = useRef<ChatbotRef>(null);

  const handleWakeup = () => {
    chatbotRef.current?.triggerMic();
  };
  useEffect(() => {
    fetchDefaultAgent();
    fetchAgentSettings();
  }, [fetchDefaultAgent, fetchAgentSettings])

  return (
      // <div className="flex-1 overflow-auto relative" style={{ height: 400 }}>
      <div className="flex-1 overflow-auto">
        { showCharacter ? <Live2d/> : <></>}    

        {/* <img src="/character.png" alt="角色" className="absolute top-0 left-0 w-full h-full object-contain object-center z-0"/> */}

        { showChatbot ? <Chatbot ref={chatbotRef} showChatHistory={true}/> : null }
        <VoiceWakeupIndicator onWakeup={() => {
          console.log("唤醒事件已触发");
          console.log("chatbotRef.current", chatbotRef.current);
          chatbotRef.current?.triggerMic();
        }} />
      </div>
  );
}
