import { UIState } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export function ChatList({ messages }: { messages: UIState[] }) {
  if (!messages.length) {
    return null;
  }
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index} className="pb-4 prose">
          {message.display}
        </div>
      ))}
    </div>
  );
}
