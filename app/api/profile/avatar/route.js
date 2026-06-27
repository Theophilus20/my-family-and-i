// app/api/profile/avatar/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Roughly cap the stored image. Base64 inflates ~33%, so ~1.4MB of base64
// is ~1MB of image — plenty for a profile photo.
const MAX_LEN = 1_400_000;

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { avatar } = await req.json();
    if (typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
    }
    if (avatar.length > MAX_LEN) {
      return NextResponse.json({ error: 'Image too large. Please choose a smaller photo (under ~1MB).' }, { status: 400 });
    }

    await query('UPDATE users SET avatar_url = $2 WHERE id = $1', [session.id, avatar]);
    return NextResponse.json({ ok: true, avatar });
  } catch (err) {

    return NextResponse.json({ error: 'Could not save photo' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await query('UPDATE users SET avatar_url = NULL WHERE id = $1', [session.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {

    return NextResponse.json({ error: 'Could not remove photo' }, { status: 500 });
  }
}