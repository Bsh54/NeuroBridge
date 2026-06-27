import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const IMOLE_URL = process.env.AFRI_API_URL ?? "https://api.imole.app/v1/responses";
const IMOLE_KEY = process.env.AFRI_API_KEY ?? "";
const MODEL = "gpt-5.4-mini";

function extractText(data: any): string {
  let text = "";
  for (const item of data?.output ?? []) {
    if (item?.type === "message") {
      for (const c of item?.content ?? []) {
        if (c?.type === "output_text") text += c?.text ?? "";
      }
    }
  }
  return text;
}

export async function POST(req: NextRequest) {
  const { question, childName, topNeeds, recentHistory } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "No question" }, { status: 400 });
  if (!IMOLE_KEY) return NextResponse.json({ error: "Not configured" }, { status: 500 });

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
  const timer = setTimeout(() => ctrl.abort(), 30000);

  let text = "";
  try {
    const res = await fetch(IMOLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${IMOLE_KEY}`,
        "User-Agent": "NeuroBridge",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: system,
        input: question,
        max_output_tokens: 350,
        temperature: 1,
      }),
      signal: ctrl.signal,
    });
    const data = await res.json();
    text = extractText(data);
  } catch {
    clearTimeout(timer);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
  clearTimeout(timer);

  if (!text) return NextResponse.json({ error: "Upstream error" }, { status: 502 });

  // Stream the answer to the browser word by word (Imole returns it whole).
  const encoder = new TextEncoder();
  const parts = text.match(/\S+\s*/g) ?? [text];
  const readable = new ReadableStream({
    start(controller) {
      for (const p of parts) controller.enqueue(encoder.encode(p));
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
