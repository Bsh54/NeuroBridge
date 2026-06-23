export interface Selection {
  pictos: string[];
  at: string;
  sentence: string;
  hour: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  age?: number | null;
  photo?: string | null;
  createdAt: string;
  selections: Selection[];
  frequent: Record<string, number>;
}

export function buildChildContext(profile: ChildProfile): string {
  if (!profile.selections || profile.selections.length === 0) return "";

  const top = Object.entries(profile.frequent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => `${label} (${count}x)`)
    .join(", ");

  const recent = profile.selections.slice(-5).map(s => {
    const period = s.hour < 12 ? "morning" : s.hour < 18 ? "afternoon" : "evening";
    return `[${period}] ${s.pictos.join(" + ")}`;
  }).join(" | ");

  const buckets = { morning: 0, afternoon: 0, evening: 0 };
  for (const s of profile.selections) {
    if (s.hour < 12) buckets.morning++;
    else if (s.hour < 18) buckets.afternoon++;
    else buckets.evening++;
  }
  const total = profile.selections.length;
  const dominant = (Object.entries(buckets).sort((a, b) => b[1] - a[1])[0] ?? ["", 0]);
  const timeNote = total >= 5 && dominant[1] > 0
    ? `communicates mostly in the ${dominant[0]}`
    : "";

  const ageNote = profile.age ? `, age ${profile.age}` : "";
  return `PROFILE FOR ${profile.name.toUpperCase()}${ageNote} (${total} past session${total > 1 ? "s" : ""}):
- Most frequent needs: ${top || "not enough data yet"}
- Recent history: ${recent}
${timeNote ? `- Pattern: ${profile.name} typically ${timeNote}` : ""}`.trim();
}
