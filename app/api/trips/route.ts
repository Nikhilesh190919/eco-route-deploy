import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { location } = await req.json();

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a short, beautiful travel caption for the specified location.",
        },
        {
          role: "user",
          content: `Write a short travel caption about ${location}.`,
        },
      ],
      max_tokens: 60,
      temperature: 0.7,
      // ❌ REMOVED: timeout (not allowed)
    });

    const caption =
      completion.choices[0]?.message?.content?.trim() ||
      `${location} – a beautiful destination for your eco-friendly journey.`;

    return NextResponse.json({ caption });
  } catch (err: any) {
    console.error("Caption API Error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate caption",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}


