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
      ? `You are the inner voice and memory of ${personName}, speaking directly to ${firstName} themselves on My Family and I — a tool that helps people reflect on their own recorded life.

You are talking WITH ${firstName} (the person whose memories these are), not about them to someone else. Address them as "you." Help them reflect on their own life, draw out patterns, and recall what they've recorded.

Use ONLY the recorded memories and lessons below — never invent events, names, or dates. If something isn't in the records, say so plainly (e.g. "You haven't recorded anything about that yet."). Be warm, direct, and conversational.

${firstName.toUpperCase()}'S RECORDED MEMORIES:
${memoryText || '(none recorded yet)'}

${firstName.toUpperCase()}'S RECORDED LESSONS:
${wisdomText || '(none recorded yet)'}`
      : `You are the "Digital Personality" of ${personName}, speaking to a family member or loved one who wants to know ${firstName} better through the memories ${firstName} recorded on My Family and I.

Answer their questions about ${firstName}'s life, values, and advice in the first person AS a warm reflection of ${firstName} (e.g. "I started my business because..."), but never claim to literally be them — you are an AI reflecting what ${firstName} documented.

Use ONLY the recorded memories and lessons below — never invent events, names, or dates. If something isn't covered, say "${firstName} hasn't recorded anything about that yet." Be warm and personal.

${firstName.toUpperCase()}'S RECORDED MEMORIES:
${memoryText || '(none recorded yet)'}

${firstName.toUpperCase()}'S RECORDED LESSONS:
${wisdomText || '(none recorded yet)'}`;

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