import { NextRequest, NextResponse } from "next/server";
import { addSelection } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { profileId, pictos, sentence } = await req.json();
  if (!profileId || !Array.isArray(pictos) || !sentence) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const profile = addSelection(profileId, pictos, sentence);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json({ profile });
}
