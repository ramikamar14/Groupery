import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function chooseModel(question: string) {
  const q = question.toLowerCase();

  if (q.includes("review") || q.includes("bug") || q.includes("analyze")) {
    return "claude";
  }

  return "gpt";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question = body.question;

  const model = chooseModel(question);

  let answer = "";

  if (model === "claude") {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 800,
      messages: [{ role: "user", content: question }],
    });

    answer = response.content[0].text;
  } else {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: question }],
    });

    answer = response.choices[0].message.content!;
  }

  return NextResponse.json({ model, answer });
}