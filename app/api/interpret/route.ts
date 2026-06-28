import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserMessage } from "@/lib/core-prompt";
import { callImole, imoleConfigured } from "@/lib/imole";

export const runtime = "nodejs";

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
  if (!imoleConfigured())
    return NextResponse.json({ sentence: "The service is not configured. Please try again later." });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 40000);
  try {
    const raw = await callImole(
      buildSystemPrompt(),
      buildUserMessage(name, pictos, pictos.length, childContext ?? ""),
      200,
      ctrl.signal,
    );
    const sentence = normalize(raw);
    return NextResponse.json({ sentence: sentence || "Something went wrong. Please try again." });
  } catch (e) {
    console.error("[interpret] failed", e);
    return NextResponse.json({ sentence: "Something went wrong. Please try again." });
  } finally {
    clearTimeout(timer);
  }
}
