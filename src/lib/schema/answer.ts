import { DeepPartial } from "ai";
import { z } from "zod";

export const answerSchema = z.object({
  answer: z.string().describe("answer to the question."),
  relatedQuestions: z
    .array(z.string())
    .length(2)
    .describe("two related questions."),
});

export type PartialAnswer = DeepPartial<typeof answerSchema>;

export type Answer = z.infer<typeof answerSchema>;
