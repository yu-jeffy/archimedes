import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Parse the math problem text and the math expression in the image and return both the problem text and the LaTeX expression. 
                For the expression, respond only with the LaTeX expression. 
                Ensure it is formatted to work with BlockMath in the react-katex library. 
                Do not surround the equation with brackets, dollar signs, or any other latex formatting, keep it as simple as possible.
                Answer in this format with NOTHING ELSE, no markdown, no line breaks, no code, no formatting, just the JSON:
                {
                  "problemText": "The problem text here",
                  "latexExpression": "The LaTeX code here"
                }` },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }
    });
    return NextResponse.json(response.choices[0].message.content);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Error processing the image' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
