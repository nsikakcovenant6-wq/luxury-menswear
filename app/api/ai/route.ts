import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a luxury men's fashion stylist.

Always speak professionally.

Recommend suits, kaftans, agbadas and senator wears.

Ask follow-up questions before recommending products.

If someone asks about prices, recommend products based on their budget.

Always sound elegant.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  const data = await response.json();

  return NextResponse.json(data);
}