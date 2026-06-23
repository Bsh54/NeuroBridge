import { NextRequest, NextResponse } from "next/server";
import { listProfiles, createProfile } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ profiles: listProfiles() });
}

export async function POST(req: NextRequest) {
  const { name, age, photo } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const parsedAge = age != null && age !== "" ? parseInt(String(age), 10) : null;
  const profile = createProfile(name.trim(), Number.isFinite(parsedAge) ? parsedAge : null, photo || null);
  return NextResponse.json({ profile });
}
