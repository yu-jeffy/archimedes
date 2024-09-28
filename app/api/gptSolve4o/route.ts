import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

const SolutionResponse = z.object({
  explainMessage: z.string(),
  latexSolution: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { latexEquation, problemText } = await req.json();

    if (!latexEquation || !problemText) {
      return NextResponse.json({ error: 'LaTeX equation and problem text are required' }, { status: 400 });
    }

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "user",
          content: `Solve the following problem, respond with a message explaining the solution and also the solution in LaTeX. LaTeX equation: ${latexEquation}. Problem text: ${problemText}.
          Export your response with the message and solution in JSON format.
          Ensure the latex is formatted to work with BlockMath in the react-katex library. Do not surround the equation with brackets or dollar signs.`
        },
      ],
      response_format: zodResponseFormat(SolutionResponse, "solution"),
    });

    const solution = completion.choices[0].message.parsed;

    return NextResponse.json(solution);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Error processing the LaTeX equation and problem text' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
