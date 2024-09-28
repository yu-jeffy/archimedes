import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY});

export async function POST(req: NextRequest) {
  try {
    const { latexEquation, problemText } = await req.json();

    if (!latexEquation || !problemText) {
      return NextResponse.json({ error: 'LaTeX equation and problem text are required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Explain the concepts shown in the following LaTeX equation and problem text so we can solve the problem, without providing a solution. LaTeX equation: ${latexEquation}. Problem text: ${problemText}.
          Respond in plain text, no markdown, no LaTeX, no code, no formatting, just a paragraph of text. Just plain text.
          Short and concise.`
        },
      ],
    });
    
    return NextResponse.json(response.choices[0].message.content);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Error processing the LaTeX equation and problem text' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
