import { NextRequest, NextResponse } from "next/server";
import { getProfile, deleteProfile } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = getProfile(id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ profile });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteProfile(id);
  return NextResponse.json({ ok: true });
}
