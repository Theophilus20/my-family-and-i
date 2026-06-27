// app/api/extract-timeline/route.js
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listMemories } from '@/lib/memories';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI is not configured. Set OPENROUTER_API_KEY.' }, { status: 500 });
    }

    const memories = await listMemories(userId).catch(() => []);
    if (memories.length === 0) {
      return NextResponse.json(
        { error: 'Add some memories first — the AI builds your timeline from them.' },
        { status: 400 }
      );
    }

    const memoryText = memories
      .map((m) => `- [${m.type}] ${m.title}: ${m.body || ''}`)
      .join('\n');

    const systemPrompt = `You extract dated life events from a person's recorded memories to build a life timeline. Use ONLY the memories provided — never invent events or dates. Only include an event if a year can reasonably be determined from the text. If no year is determinable for a memory, skip it.

Return STRICT JSON only (no markdown, no backticks): an array of events, each:
{ "year": 2008, "title": "short event title", "description": "one short sentence" }

Order does not matter. Return an empty array [] if no dated events can be found.`;

    const userPrompt = `RECORDED MEMORIES:\n${memoryText}\n\nExtract the dated life events as strict JSON array.`;

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 900,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return NextResponse.json({ error: `AI request failed: ${detail.slice(0, 200)}` }, { status: 502 });
    }

    const data = await resp.json();
    let raw = data.choices?.[0]?.message?.content?.trim() || '';
    raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    let events;
    try {
      events = JSON.parse(raw);
      if (!Array.isArray(events)) throw new Error('not an array');
    } catch {
      return NextResponse.json({ error: 'AI returned an unexpected format. Please try again.' }, { status: 502 });
    }

    let added = 0;
    for (const ev of events) {
      const year = parseInt(ev.year, 10);
      const title = (ev.title || '').trim();
      if (!Number.isInteger(year) || !title) continue;

      const dup = await queryOne(
        `SELECT id FROM timeline_events WHERE user_id = $1 AND year = $2 AND title = $3`,
        [userId, year, title]
      );
      if (dup) continue;

      await query(
        `INSERT INTO timeline_events (user_id, year, title, description)
         VALUES ($1, $2, $3, $4)`,
        [userId, year, title, (ev.description || '').trim()]
      );
      added++;
    }

    return NextResponse.json({ added });
  } catch (err) {

    return NextResponse.json({ error: err.message || 'Could not extract timeline' }, { status: 500 });
  }
}