import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { latexEquation, problemText } = await req.json();

    if (!latexEquation || !problemText) {
      return NextResponse.json({ error: 'LaTeX equation and problem text are required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          role: "user",
          content: `Solve the following problem.
          Problem: ${problemText}, Equation: ${latexEquation}
          Walk the user through the solution step by step.
          Answer in markdown format.`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (content) {
      // Return the content directly as a string
      return NextResponse.json({ solution: content });
    } else {
      // Handle the case where content is null
      return NextResponse.json({ error: "No content available" });
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Error processing the LaTeX equation and problem text' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
