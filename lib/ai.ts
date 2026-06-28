// Unified AI client. Tries Gemini first (Google infra, reliable), then falls
// back to Imole if Gemini is unavailable. Each provider cycles through models.

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

const IMOLE_URL = process.env.AFRI_API_URL ?? "https://api.imole.app/v1/responses";
const IMOLE_KEY = process.env.AFRI_API_KEY ?? "";
const IMOLE_MODELS = ["gpt-5.4-mini", "gpt-5.4", "gpt-5.5"];

export function aiConfigured(): boolean {
  return !!GEMINI_KEY || !!IMOLE_KEY;
}

// ── Gemini (generateContent) ──────────────────────────────────────────────────
function geminiExtract(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: any) => p?.text ?? "").join("");
}

async function tryGemini(instructions: string, input: string, maxTokens: number, signal: AbortSignal): Promise<string> {
  let lastErr = "";
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-goog-api-key": GEMINI_KEY },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: instructions }] },
            contents: [{ role: "user", parts: [{ text: input }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 1 },
          }),
          signal,
        },
      );
      const data = await res.json();
      const text = geminiExtract(data);
      if (text.trim()) return text;
      lastErr = `${res.status} ${JSON.stringify(data?.error ?? data).slice(0, 160)}`;
    } catch (e: any) {
      if (e?.name === "AbortError") throw e;
      lastErr = String(e?.message ?? e);
    }
  }
  throw new Error("gemini: " + lastErr);
}

// ── Imole (Responses API) ─────────────────────────────────────────────────────
function imoleExtract(data: any): string {
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

async function tryImole(instructions: string, input: string, maxTokens: number, signal: AbortSignal): Promise<string> {
  let lastErr = "";
  for (const model of IMOLE_MODELS) {
    try {
      const res = await fetch(IMOLE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${IMOLE_KEY}`,
          "User-Agent": "NeuroBridge",
        },
        body: JSON.stringify({ model, instructions, input, max_output_tokens: maxTokens, temperature: 1 }),
        signal,
      });
      const data = await res.json();
      const text = imoleExtract(data);
      if (text.trim()) return text;
      lastErr = `${res.status} ${JSON.stringify(data?.error ?? data).slice(0, 160)}`;
    } catch (e: any) {
      if (e?.name === "AbortError") throw e;
      lastErr = String(e?.message ?? e);
    }
  }
  throw new Error("imole: " + lastErr);
}

// ── Public entry: Gemini first, Imole fallback ───────────────────────────────
export async function callAI(instructions: string, input: string, maxTokens: number, signal: AbortSignal): Promise<string> {
  let geminiErr = "";
  if (GEMINI_KEY) {
    try {
      return await tryGemini(instructions, input, maxTokens, signal);
    } catch (e: any) {
      if (e?.name === "AbortError") throw e;
      geminiErr = String(e?.message ?? e);
      console.error("[ai] gemini failed, trying imole:", geminiErr);
    }
  }
  if (IMOLE_KEY) {
    return await tryImole(instructions, input, maxTokens, signal);
  }
  throw new Error(geminiErr || "no provider configured");
}
