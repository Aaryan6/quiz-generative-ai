import { NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
  }
}
