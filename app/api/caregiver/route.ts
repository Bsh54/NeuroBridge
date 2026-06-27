import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AFRI_API = process.env.AFRI_API_URL ?? "https://build.lewisnote.com/v1/chat/completions";
const AFRI_KEY = process.env.AFRI_API_KEY ?? "";

export async function POST(req: NextRequest) {
  const { question, childName, topNeeds, recentHistory } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "No question" }, { status: 400 });
  if (!AFRI_KEY) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const needsSummary = topNeeds?.length
    ? topNeeds.map(([l, n]: [string, number]) => `${l} (${n}x)`).join(", ")
    : "none recorded yet";

  const historySummary = recentHistory?.length
    ? recentHistory.slice(0, 8).map((s: any) => `- "${s.sentence}" [${s.pictos.join(", ")}]`).join("\n")
    : "no communications yet";

  const system = `You are an expert in autism, AAC communication, and supporting non-verbal children. You help caregivers better understand and support the child they care for.

You have access to ${childName}'s profile:
Most frequent expressions: ${needsSummary}
Recent communications:
${historySummary}

Answer the caregiver's question with empathy and practical insight. Be specific to ${childName}'s patterns when relevant. Keep answers concise and actionable. English only.

IMPORTANT: Write in plain text only. Do not use markdown. No asterisks, no bold, no headers, no bullet points, no hyphens as list markers. Write in clear conversational sentences.`;

  const ctrl = new AbortController();
  const connectTimer = setTimeout(() => ctrl.abort(), 30000);

  let upstream: Response;
  try {
    upstream = await fetch(AFRI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${AFRI_KEY}` },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
        max_tokens: 350,
        stream: true,
      }),
      signal: ctrl.signal,
    });
  } catch {
    clearTimeout(connectTimer);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
  clearTimeout(connectTimer);

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";        // keep partial last line
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (payload === "[DONE]") { controller.close(); return; }
            try {
              const parsed = JSON.parse(payload);
              const token: string = parsed.choices?.[0]?.delta?.content ?? "";
              if (token) controller.enqueue(encoder.encode(token));
            } catch { /* incomplete chunk, ignore */ }
          }
        }
      } catch { /* stream interrupted */ }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
