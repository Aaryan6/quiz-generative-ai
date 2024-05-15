import { answerSchema, PartialAnswer } from "@/lib/schema/answer";
import { CoreMessage, streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { BotMessage } from "./bot-message";

type Props = {
  uiStream: ReturnType<typeof createStreamableUI>;
  messages: CoreMessage[];
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export async function JsonStream({ uiStream, messages }: Props) {
  const stream = createStreamableValue<PartialAnswer>();

  uiStream.append(<BotMessage message={stream.value} />);

  let finalInquiry: PartialAnswer = {};
  await streamObject({
    model: google("models/gemini-1.5-pro-latest"),
    system: "You are a educational chatbot.",
    messages,
    schema: answerSchema,
  })
    .then(async ({ partialObjectStream }) => {
      for await (const partialObject of partialObjectStream) {
        if (partialObject) {
          stream.update(partialObject);
          finalInquiry = partialObject;
        }
      }
    })
    .finally(() => {
      stream.done();
    });

  return finalInquiry;
}
