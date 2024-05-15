"use client";

import { useAIState, useUIState } from "ai/rsc";
import { ChatMessage } from "./chat-message";
import { ChatPanel } from "./chat-panel";

export const Chat = () => {
  const [messages] = useUIState();
  const [aiState] = useAIState();

  return (
    <div className="">
      <ChatMessage aiState={aiState} messages={messages} />
      <div className="fixed inset-x-0 bottom-0 w-full">
        <div className="max-w-2xl mx-auto">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};
