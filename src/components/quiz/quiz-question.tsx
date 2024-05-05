"use client";

import React, { useState } from "react";
import { useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/actions";
import { MemoizedReactMarkdown } from "../markdown";
import { UserMessage } from "../message";
import { Button } from "../ui/button";
import { nanoid } from "ai";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

// @ts-ignore
export default function QuizQuestion({
  question,
  questionType,
  possibleAnswers,
}: any) {
  const [answerUI, setAnswerUI] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [, setMessages] = useUIState<typeof AI>();
  const { submitAnswer } = useActions<typeof AI>();
  const isMultipleChoice = questionType === "multiple-options";

  const handleOption = (value: any) => {
    setSelectedOption(value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isMultipleChoice && !selectedOption) {
      console.log("no options selected!");
      return;
    }
    // Add user message UI
    setMessages((currentMessages: any[]) => [
      ...currentMessages,
      {
        id: nanoid(),
        display: (
          <UserMessage>{`My answer is: "${selectedOption}"`}</UserMessage>
        ),
      },
    ]);

    // @ts-ignore
    const response = await submitAnswer(selectedOption);
    console.log(response);
    setAnswerUI(response.answerUI);
    // Insert a new system message to the UI.
    setMessages((currentMessages: any[]) => [
      ...currentMessages,
      response.newMessage,
    ]);
  };

  return (
    <Card className="w-full flex flex-col gap-2 items-start justify-center">
      <MemoizedReactMarkdown className={"bg-muted p-4 w-full"}>
        {question}
      </MemoizedReactMarkdown>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="p-2 flex flex-col">
          {/* @ts-ignore */}
          {possibleAnswers.map((option: any, index) => (
            <Button
              variant={"ghost"}
              disabled={answerUI}
              key={index}
              className={cn(
                "cursor-pointer w-full text-left justify-start gap-2 py-6",
                index === 0 ? "" : "border-t",
                option === selectedOption ? "bg-muted" : "bg-background"
              )}
              name={`option_${index}`}
              value={selectedOption}
              onClick={() => handleOption(option)}
            >
              <MemoizedReactMarkdown>{option}</MemoizedReactMarkdown>
            </Button>
          ))}
        </div>
      </form>
    </Card>
  );
}
