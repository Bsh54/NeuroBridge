import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserMessage } from "@/lib/core-prompt";

export const runtime = "nodejs";

const IMOLE_URL = process.env.AFRI_API_URL ?? "https://api.imole.app/v1/responses";
const IMOLE_KEY = process.env.AFRI_API_KEY ?? "";
const MODEL = "gpt-5.4-mini";

// Imole uses the Responses API. Pull the text out of its output array.
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
  if (!IMOLE_KEY)
    return NextResponse.json({ sentence: "The service is not configured. Please try again later." });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
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
        instructions: buildSystemPrompt(),
        input: buildUserMessage(name, pictos, pictos.length, childContext ?? ""),
        max_output_tokens: 200,
        temperature: 1,
      }),
      signal: ctrl.signal,
    });
    const data = await res.json();
    const raw = extractText(data);
    if (!raw) {
      console.error("[interpret] no content. status", res.status, JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ sentence: "Something went wrong. Please try again." });
    }
    const sentence = normalize(raw);
    return NextResponse.json({ sentence: sentence || "Something went wrong. Please try again." });
  } catch (e) {
    console.error("[interpret] fetch failed", e);
    return NextResponse.json({ sentence: "Something went wrong. Please try again." });
  } finally {
    clearTimeout(timer);
  }
}
