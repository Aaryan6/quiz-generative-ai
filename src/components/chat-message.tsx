import { cn } from "@/lib/utils";
import { UIState } from "@/app/actions";
import { useEffect, useRef } from "react";

export interface ChatMessageProps {
  messages: UIState;
  aiState: any;
}

export function ChatMessage({ messages, aiState }: ChatMessageProps) {
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiState?.messages]);
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-4 max-w-3xl mx-auto pt-10 overflow-y-auto"
      )}
    >
      {messages.map((message, index: number) => {
        return (
          <div className="" key={message.id ?? index}>
            {message.component}
          </div>
        );
      })}
      <div ref={bottomScrollRef} className="pb-12" />
    </div>
  );
}
