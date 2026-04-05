import { NextResponse } from 'next/server';

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const FLASK_URL = "https://pp-hhl3.onrender.com"

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('zipFile');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No ZIP file received.' }, { status: 400 });
    }

    if (!file.name?.toLowerCase().endsWith('.zip')) {
      return NextResponse.json({ error: 'Please upload a .zip file from Samsung Health.' }, { status: 400 });
    }

    // Forward to Render Flask backend
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${FLASK_URL}/predict`, {
      method: 'POST',
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Server error' }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error('Diagnose API error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error.' }, { status: 500 });
  }
}