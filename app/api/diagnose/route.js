import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Max upload size: 100MB

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request) {
  let tmpPath = null;

  try {
    // ── 1. Parse form data ──────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('zipFile');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No ZIP file received.' }, { status: 400 });
    }

    // Validate file type
    const fileName = file.name || 'upload.zip';
    if (!fileName.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Please upload a .zip file exported from Samsung Health.' },
        { status: 400 }
      );
    }

    // ── 2. Write file to /tmp ───────────────────────────────────────
    const tmpDir = '/tmp/dementia_uploads';
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    const timestamp = Date.now();
    tmpPath = join(tmpDir, `upload_${timestamp}.zip`);

    const bytes = await file.arrayBuffer();
    await writeFile(tmpPath, Buffer.from(bytes));

    // ── 3. Locate Python script ─────────────────────────────────────
    const pythonDir   = join(process.cwd(), 'python');
    const scriptPath  = join(pythonDir, 'dementia_predict.py');
    const modelPath   = join(pythonDir, 'dementia_model.pkl');

    if (!existsSync(scriptPath)) {
      return NextResponse.json(
        { error: 'Model script not found. Make sure dementia_predict.py is in the /python folder.' },
        { status: 500 }
      );
    }
    if (!existsSync(modelPath)) {
      return NextResponse.json(
        { error: 'Model file not found. Make sure dementia_model.pkl is in the /python folder.' },
        { status: 500 }
      );
    }

    // ── 4. Run Python prediction ────────────────────────────────────
    const python = process.platform === 'win32' ? 'python' : 'python3';
    const cmd    = `${python} "${scriptPath}" "${tmpPath}" --json`;

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: pythonDir,
      timeout: 120000, // 2 min timeout
    });

    // ── 5. Parse JSON output ────────────────────────────────────────
    // Find JSON block in stdout (script outputs JSON on last line prefixed with JSON_OUTPUT:)
    const lines    = stdout.split('\n');
    const jsonLine = lines.find((l) => l.startsWith('JSON_OUTPUT:'));

    if (!jsonLine) {
      console.error('Python stderr:', stderr);
      console.error('Python stdout:', stdout);
      return NextResponse.json(
        { error: 'Could not parse model output. Check that your ZIP contains Samsung Health data.' },
        { status: 500 }
      );
    }

    const jsonStr    = jsonLine.replace('JSON_OUTPUT:', '').trim();
    const prediction = JSON.parse(jsonStr);

    return NextResponse.json(prediction, { status: 200 });

  } catch (err) {
    console.error('Diagnose API error:', err);

    // Friendly error messages
    if (err.message?.includes('python3') || err.message?.includes('python')) {
      return NextResponse.json(
        { error: 'Python 3 is not installed or not found. Please install Python 3 and required packages.' },
        { status: 500 }
      );
    }
    if (err.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Analysis timed out. Your ZIP may be very large. Try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );

  } finally {
    // ── 6. Cleanup tmp file ─────────────────────────────────────────
    if (tmpPath && existsSync(tmpPath)) {
      await unlink(tmpPath).catch(() => {});
    }
  }
}
