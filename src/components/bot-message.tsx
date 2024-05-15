"use client";
import { AI } from "@/app/actions";
import { PartialAnswer } from "@/lib/schema/answer";
import { nanoid } from "ai";
import { useActions, useStreamableValue, useUIState } from "ai/rsc";
import { Bot } from "lucide-react";
import { UserMessage } from "./user-message";

type BotMessageProps = {
  message: PartialAnswer;
};

export const BotMessage: React.FC<BotMessageProps> = ({ message }) => {
  const [data] = useStreamableValue<PartialAnswer>(message);
  const [_, setMessages] = useUIState<typeof AI>();
  const { submit } = useActions();

  const followUp = async (inputValue: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nanoid(),
        component: <UserMessage message={inputValue} />,
      },
    ]);

    const res = await submit(inputValue);

    setMessages((currentMessages) => [...currentMessages, res as any]);
  };

  if (!data) return;
  return (
    <div className={"group relative flex items-start"}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-primary text-primary-foreground overflow-hidden">
        <Bot size={18} />
      </div>
      <div className="ml-4 flex-1 overflow-hidden px-1">
        <p className="bg-muted rounded-md p-4 text-foreground/80 whitespace-pre-wrap">
          {data?.answer}
        </p>
        <div className="space-y-2 mt-2">
          {data?.relatedQuestions?.map((q, i) => (
            <button
              key={i}
              className="bg-muted rounded-md py-1 px-2 text-foreground/80"
              onClick={() => followUp(q!)}
            >
              Q. {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
