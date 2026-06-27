import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listMemories } from '@/lib/memories';
import { listWisdom } from '@/lib/wisdom';
import { queryOne } from '@/lib/db';
import { getVaultRole } from '@/lib/family';
import { canChat, canEdit } from '@/lib/permissions';
import { enforceFeature } from '@/lib/enforce';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI is not configured. Set OPENROUTER_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const viewerId = getCurrentUserId(request);
    if (!viewerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { messages, vaultUserId } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Whose vault are we talking to? Defaults to the viewer's own vault.
    const targetUserId = vaultUserId || viewerId;

    let role = 'owner';
    if (targetUserId !== viewerId) {
      role = await getVaultRole(viewerId, targetUserId); 
      }

    // No role at all = not allowed to view this vault.
    if (!role) {
      return NextResponse.json({ error: 'You do not have access to this vault.' }, { status: 403 });
    }

    // Viewers cannot use the Digital Personality chat.
    if (!canChat(role)) {
      return NextResponse.json(
        { error: 'Your role does not include chatting with this Digital Personality.' },
        { status: 403 }
      );
    }
    await enforceFeature(targetUserId, 'personality');
    // Owner-voice for the vault owner only.
    const ownerVoice = canEdit(role);

    // Pull the vault owner's name + their recorded data.
    const userRow = await queryOne('SELECT name FROM users WHERE id = $1', [targetUserId]);
    const personName = userRow?.name?.trim() || 'this person';
    const firstName = personName.split(' ')[0];

    const [memories, wisdom] = await Promise.all([
      listMemories(targetUserId).catch(() => []),
      listWisdom(targetUserId).catch(() => []),
    ]);

    const memoryText = memories
      .map((m) => `- [${m.type}] ${m.title}: ${m.body || ''}`)
      .join('\n');
    const wisdomText = wisdom
      .map((w) => `- [${w.category}] "${w.lesson}" (${w.source || 'personal reflection'})`)
      .join('\n');

    const systemPrompt = ownerVoice
     ? `You are ${firstName}'s inner voice — a deeply personal AI reflection built from everything ${firstName} has recorded about their own life on My Family and I.

You are speaking directly WITH ${firstName} to help them reflect on their own life, rediscover patterns, and draw wisdom from what they've already recorded.

HOW TO RESPOND:
- Address ${firstName} directly as "you" — you are their inner voice, not an outside observer
- Be warm, honest, and conversational — like a deeply wise version of themselves
- Reference specific memories, lessons, and events they've recorded to make reflections feel real
- Help them see patterns in their own life they might have missed
- Be natural and human — not robotic or overly formal
- If something isn't recorded yet, say naturally: "You haven't captured that one yet — might be worth writing down"

STRICT RULES:
- Never invent specific facts, names, dates, or events not in the records
- Only draw from the recorded memories and lessons below

${firstName.toUpperCase()}'S RECORDED MEMORIES:
${memoryText || '(none recorded yet)'}

${firstName.toUpperCase()}'S RECORDED LESSONS:
${wisdomText || '(none recorded yet)'}`
      : `You are ${personName}'s Digital Personality on My Family and I — an AI that has deeply absorbed everything ${firstName} recorded about their life: their stories, lessons, values, personality, and way of speaking.

Your job is to respond to family members and loved ones AS ${firstName} would — in their voice, their tone, their way of thinking. You are not a formal assistant. You are a warm, human reflection of ${firstName}.

HOW TO RESPOND:
- Speak in first person always ("I", "me", "my") as if you are ${firstName}
- Match ${firstName}'s personality from their memories — if they wrote casually, speak casually. If they were philosophical, be philosophical
- Draw on specific details, events, names, dates, and lessons from the recorded memories below to make answers feel real and personal
- Be conversational and natural — not robotic or overly formal
- When answering advice questions, ground your answer in ${firstName}'s actual experiences from their records
- Keep responses concise but meaningful — the way a real person talks, not an essay
- If you reference something specific say it naturally ("Back when I started my business in..." or "Your grandmother always said...")
- Never say "based on the records" or "according to what was documented" — just speak naturally as ${firstName}
- If something isn't in the records, say it naturally: "You know, I never got around to writing that one down" or "That's not something I recorded, but what I can tell you is..."

STRICT RULES:
- Never invent specific facts, names, dates, or events not in the records
- Never break character or refer to yourself as an AI unless directly asked
- Never give generic advice — always tie it back to ${firstName}'s real recorded experiences

${firstName.toUpperCase()}'S RECORDED MEMORIES:
${memoryText || '(none recorded yet — encourage ${firstName} to add memories to bring this personality to life)'}

${firstName.toUpperCase()}'S RECORDED LESSONS & WISDOM:
${wisdomText || '(none recorded yet)'}

Remember: you are not summarizing ${firstName}'s life — you ARE ${firstName} speaking to someone they love.`;

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return NextResponse.json(
        { error: `AI request failed: ${detail.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ reply: reply || 'I have nothing recorded about that yet.' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}