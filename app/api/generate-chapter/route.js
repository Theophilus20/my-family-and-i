// app/api/generate-chapter/route.js
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listMemories } from '@/lib/memories';
import { listWisdom } from '@/lib/wisdom';
import { listChapters, addChapter } from '@/lib/bio';
import { queryOne } from '@/lib/db';
import { enforceFeature } from '@/lib/enforce';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
   const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await enforceFeature(userId, 'biographer');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI is not configured. Set OPENROUTER_API_KEY.' }, { status: 500 });
    }

    const [memories, wisdom, existing, userRow] = await Promise.all([
      listMemories(userId).catch(() => []),
      listWisdom(userId).catch(() => []),
      listChapters(userId).catch(() => []),
      queryOne('SELECT name FROM users WHERE id = $1', [userId]),
    ]);

    if (memories.length === 0 && wisdom.length === 0) {
      return NextResponse.json(
        { error: 'Add some memories or lessons first — the AI writes chapters from your real records.' },
        { status: 400 }
      );
    }

    const personName = userRow?.name?.trim() || 'this person';
    const memoryText = memories.map((m) => `- [${m.type}] ${m.title}: ${m.body || ''}`).join('\n');
    const wisdomText = wisdom.map((w) => `- [${w.category}] ${w.lesson} (${w.source || 'reflection'})`).join('\n');
    const alreadyCovered = existing.map((c) => `- ${c.title} (${c.years || ''})`).join('\n') || '(none yet)';

    const systemPrompt = `You are a thoughtful biographer writing one chapter of ${personName}'s life story for the app My Family and I. Write ONLY from the recorded memories and lessons provided — never invent events, names, dates, or details that aren't supported by the records. Write in warm, third-person narrative prose.

Return STRICT JSON only (no markdown, no backticks) with exactly this shape:
{
  "title": "a short evocative chapter title",
  "years": "an approximate year range if inferable from the records, else an empty string",
  "summary": "2-4 sentences of narrative prose drawn only from the records",
  "lessons": ["1 to 3 short life lessons that genuinely come from the records"]
}`;

    const userPrompt = `RECORDED MEMORIES:
${memoryText || '(none)'}

RECORDED LESSONS:
${wisdomText || '(none)'}

CHAPTERS ALREADY WRITTEN (write a DIFFERENT one, don't repeat these):
${alreadyCovered}

Write the next chapter as strict JSON.`;

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 800,
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

    let chapter;
    try {
      chapter = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned an unexpected format. Please try again.' }, { status: 502 });
    }

    const saved = await addChapter(userId, {
      title: chapter.title || 'Untitled Chapter',
      years: chapter.years || '',
      summary: chapter.summary || '',
      lessons: Array.isArray(chapter.lessons) ? chapter.lessons : [],
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {

    return NextResponse.json({ error: err.message || 'Could not generate chapter' }, { status: 500 });
  }
}