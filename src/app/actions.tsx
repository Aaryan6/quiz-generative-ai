"use server";
import { BotCard, BotMessage, UserMessage } from "@/components/message";
import { generateQuiz } from "@/components/quiz";
import QuizQuestion from "@/components/quiz/quiz-question";
import { spinner } from "@/components/spinner";
import { openai } from "@ai-sdk/openai";
import { generateText, nanoid } from "ai";
import { createAI, getAIState, getMutableAIState, streamUI } from "ai/rsc";
import React from "react";
import { z } from "zod";

async function submitAnswer(answer: string) {
  "use server";
  const response = await sendMessage(`My answer is: ${answer}`);
  console.log(response);
  return {
    answerUI: true,
    newMessage: response,
  };
}

async function sendMessage(content: string) {
  "use server";
  const aiState = getMutableAIState<typeof AI>();

  console.log(content);
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content: content,
      },
    ],
  });

  console.log(aiState.get());

  const response = await streamUI({
    temperature: 0.7,
    model: openai("gpt-3.5-turbo-1106"),
    system:
      "You are a helpful teaching assistant that deploys different methods to engage/help your students in their learning. Ask follow-up questions to get sufficient content before doing anything. DONT make up information. While asking quiz topic and options type, make sure to don't ask the possibleQuestion to the user.",
    messages: [
      ...aiState.get().messages.map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    initial: <BotMessage className="items-center">{spinner}</BotMessage>,
    text: ({ content, done }) => {
      console.log(content, done);
      if (done) {
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: "assistant",
              content,
            },
          ],
        });
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

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: "function",
                name: "generate_quiz",
                content: JSON.stringify(result),
              },
            ],
          });
          return (
            <BotCard>
              <QuizQuestion {...result} />
            </BotCard>
          );
        },
      },
    },
  });
  return {
    id: nanoid(),
    display: response.value,
  };
}

export type Message = {
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  id: string;
  name?: string;
};

export type AIState = {
  chatId: string;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: React.ReactNode;
};

// Create the AI provider with the initial states and allowed actions
export const AI: any = createAI<AIState, UIState[]>({
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  actions: {
    sendMessage,
    submitAnswer,
  },
  onGetUIState: async () => {
    "use server";
    const aiState = getAIState();
    if (aiState) {
      const uiState = getUIStateFromAIState(aiState);
      return uiState;
    }
  },
});

export const getUIStateFromAIState = (aiState: AIState) => {
  return aiState.messages
    .filter((message) => message.role.toLowerCase() !== "system")
    .map((message) => ({
      id: message.id,
      display:
        message.role.toLowerCase() === "function" ? (
          message.name === "generate_quiz" ? (
            <BotCard>
              <QuizQuestion {...JSON.parse(message.content)} />
            </BotCard>
          ) : (
            <></>
          )
        ) : message.role.toLowerCase() === "user" ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage>{message.content}</BotMessage>
        ),
    }));
};
