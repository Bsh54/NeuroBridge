import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserMessage } from "@/lib/core-prompt";

export const runtime = "nodejs";

const AFRI_API = process.env.AFRI_API_URL ?? "https://build.lewisnote.com/v1/chat/completions";
const AFRI_KEY = process.env.AFRI_API_KEY ?? "";

function normalize(raw: string): string {
  return raw
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, " ")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const { name, pictos, childContext } = await req.json();
  if (!pictos || pictos.length === 0)
    return NextResponse.json({ error: "No pictos" }, { status: 400 });
  if (!AFRI_KEY)
    return NextResponse.json({ sentence: "The service is not configured. Please try again later." });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(AFRI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${AFRI_KEY}` },
      body: JSON.stringify({
        model: "gpt-5.5",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserMessage(name, pictos, pictos.length, childContext ?? "") },
        ],
        max_tokens: 200,
      }),
      signal: ctrl.signal,
    });
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) {
      console.error("[interpret] no content. status", res.status, JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ sentence: "Something went wrong. Please try again." });
    }
    const sentence = normalize(raw);
    if (!sentence) return NextResponse.json({ sentence: "Something went wrong. Please try again." });
    return NextResponse.json({ sentence });
  } catch (e) {
    console.error("[interpret] fetch failed", e);
    return NextResponse.json({ sentence: "Something went wrong. Please try again." });
  } finally {
    clearTimeout(timer);
  }
}
