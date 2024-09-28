import { NextRequest, NextResponse } from 'next/server';

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return NextResponse.json({ error: errorResponse.error }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
