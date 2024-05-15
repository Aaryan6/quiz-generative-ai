"use server";

import { CoreMessage, nanoid } from "ai";
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  StreamableValue,
} from "ai/rsc";
import { JsonStream } from "@/components/json-stream";
import { UserMessage } from "@/components/user-message";
import { BotMessage } from "@/components/bot-message";

async function submit(content: string) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  const uiStream = createStreamableUI();
  const messages: CoreMessage[] = [...aiState.get().messages] as any[];

  if (content) {
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: "user",
          content,
        },
      ],
    });
    messages.push({
      role: "user",
      content,
    });
  }

  const processEvents = async () => {
    const answer = await JsonStream({ uiStream, messages });

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: "assistant",
          content: JSON.stringify(answer),
        },
      ],
    });

    uiStream.done();
  };

  processEvents();
  return { id: nanoid(), component: uiStream.value };
}

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

export type AIState = {
  messages: AIMessage[];
  chatId: string;
};

export type UIState = {
  id: string;
  component: React.ReactNode;
  isGenerating?: StreamableValue<boolean>;
}[];

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  messages: AIMessage[];
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submit,
  },
  initialUIState: [] as UIState,
  initialAIState: {
    chatId: nanoid(),
    messages: [],
  } as AIState,
  onGetUIState: async () => {
    "use server";

    const aiState = getAIState();
    if (aiState) {
      const uiState = getUIStateFromAIState(aiState);
      return uiState;
    } else {
      return;
    }
  },
  onSetAIState: async ({ state, done }: any) => {
    "use server";
  },
});

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages.map((message, index) => {
    const { id, role, content } = message;
    switch (role) {
      case "user":
        return {
          id,
          component: <UserMessage message={content} chatId={aiState.chatId} />,
        };
      case "assistant":
        const answer = createStreamableValue();
        answer.done(JSON.parse(content));
        console.log("content", content);
        return {
          id,
          component: <BotMessage message={answer.value} />,
        };
      default:
        return {
          id,
          component: <div />,
        };
    }
  });
};
