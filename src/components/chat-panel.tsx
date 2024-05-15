"use client";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { AI } from "@/app/actions";
import { SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "ai";
import { UserMessage } from "./user-message";

export function ChatPanel() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { submit } = useActions();
  const [_, setMessages] = useUIState<typeof AI>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nanoid(),
        component: <UserMessage message={inputValue} />,
      },
    ]);

    const res = await submit(inputValue);

    setMessages((currentMessages) => [...currentMessages, res as any]);

    setInputValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    const focusInput = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusInput);

    return () => {
      window.removeEventListener("keydown", focusInput);
    };
  }, []);

  return (
    <form onSubmit={onSubmit} ref={formRef}>
      <div className="relative flex items-center w-full px-2 overflow-hidden max-h-60 grow bg-background sm:rounded-md border sm:px-2">
        <Textarea
          ref={inputRef}
          onKeyDown={onKeyDown}
          tabIndex={0}
          placeholder="'/' to write a message"
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] srcoll-hidden focus-visible:ring-none focus-visible:ring-transparent sm:text-sm border-transparent"
          name="message"
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="">
          <Button type="submit" size="icon" disabled={inputValue === ""}>
            <SendIcon size={18} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
