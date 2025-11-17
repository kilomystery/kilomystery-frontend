// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';

const FILE = 'cache/subscribers.json';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
    }
    await mkdir('cache', { recursive: true });
    let list: string[] = [];
    if (existsSync(FILE)) list = JSON.parse(await readFile(FILE, 'utf8'));
    if (!list.includes(email)) list.push(email);
    await writeFile(FILE, JSON.stringify(list, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}