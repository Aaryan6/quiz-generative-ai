"use server";
import { BotCard, BotMessage, UserMessage } from "@/components/message";
import { generateQuiz } from "@/components/quiz";
import QuizQuestion from "@/components/quiz/quiz-question";
import { spinner } from "@/components/spinner";
import { openai } from "@ai-sdk/openai";
import { generateText, nanoid } from "ai";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import React from "react";
import { z } from "zod";

async function submitAnswer(answer: string) {
  "use server";
  const response = await sendMessage(`My answer is: ${answer}`);
  return {
    answerUI: true,
    newMessage: response,
  };
}

async function sendMessage(input: string) {
  "use server";
  const history = getMutableAIState();

  const response = await streamUI({
    model: openai("gpt-3.5-turbo-1106"),
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: AIState[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }
      return <BotMessage>{content}</BotMessage>;
    },
    tools: {
      generate_quiz: {
        description:
          "Generate a quiz question with possible answers, and manage user interactions.",
        parameters: z
          .object({
            topic: z
              .string()
              .describe("The topic of the question to generate."),
            type: z
              .enum(["multiple-options", "true/false"])
              .describe("The type of the question."),
            possibleAnswers: z
              .array(z.string())
              .describe("An array of possible answers for the question."),
          })
          .required(),
        generate: async function* ({ topic, type }) {
          yield <BotCard>{spinner}</BotCard>;
          const result = await generateQuiz(topic, type);
          console.log(result);

          history.update((messages: AIState[]) => [
            ...messages,
            {
              id: nanoid(),
              role: "function",
              name: "generate_quiz",
              content: JSON.stringify(result),
            },
          ]);
          return (
            <BotMessage>
              <QuizQuestion {...result} />
            </BotMessage>
          );
        },
      },
    },
  });
  return {
    id: nanoid(),
    role: "assistant",
    display: response.value,
  };
}

export type AIState = {
  role: "user" | "assistant";
  content: string;
};

export type UIState = {
  id: string;
  role: "user" | "assistant";
  display: React.ReactNode;
};

// Create the AI provider with the initial states and allowed actions
export const AI = createAI({
  initialAIState: [] as AIState[],
  initialUIState: [] as UIState[],
  actions: {
    sendMessage,
    submitAnswer,
  },
});
