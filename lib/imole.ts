// Direct client for the Imole Responses API, with retries and model fallback.
// Imole occasionally returns 502 "model_request_failed" (temporary). We retry
// a few times and cycle through models so transient blips self-heal.

const IMOLE_URL = process.env.AFRI_API_URL ?? "https://api.imole.app/v1/responses";
const IMOLE_KEY = process.env.AFRI_API_KEY ?? "";
const MODELS = ["gpt-5.4-mini", "gpt-5.4", "gpt-5.5"];
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = 1200;

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

export function imoleConfigured(): boolean {
  return !!IMOLE_KEY;
}

export async function callImole(
  instructions: string,
  input: string,
  maxTokens: number,
  signal: AbortSignal,
): Promise<string> {
  let lastErr = "";
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const model = MODELS[Math.min(i, MODELS.length - 1)];
    try {
      const res = await fetch(IMOLE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${IMOLE_KEY}`,
          "User-Agent": "NeuroBridge",
        },
        body: JSON.stringify({
          model,
          instructions,
          input,
          max_output_tokens: maxTokens,
          temperature: 1,
        }),
        signal,
      });
      const data = await res.json();
      const text = extractText(data);
      if (text.trim()) return text;
      lastErr = `${res.status} ${JSON.stringify(data?.error ?? data).slice(0, 160)}`;
    } catch (e: any) {
      if (e?.name === "AbortError") throw e;
      lastErr = String(e?.message ?? e);
    }
    if (i < MAX_ATTEMPTS - 1) await new Promise((r) => setTimeout(r, BACKOFF_MS));
  }
  throw new Error(lastErr || "all attempts failed");
}
