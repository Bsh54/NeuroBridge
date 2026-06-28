import { NextRequest, NextResponse } from "next/server";
import { callImole, imoleConfigured } from "@/lib/imole";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { question, childName, topNeeds, recentHistory } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "No question" }, { status: 400 });
  if (!imoleConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 500 });

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
  const timer = setTimeout(() => ctrl.abort(), 40000);

  let text = "";
  try {
    text = await callImole(system, question, 350, ctrl.signal);
  } catch (e) {
    console.error("[caregiver] failed", e);
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
