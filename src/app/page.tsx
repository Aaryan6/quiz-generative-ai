import { Chat } from "@/components/chat";
import { AI } from "./actions";
import { nanoid } from "ai";

export default function ChatPage() {
  const id = nanoid();
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat />
    </AI>
  );
}
