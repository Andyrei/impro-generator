import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import Word from "@/lib/db/models/word";
import { isAdmin } from "@/lib/isAdmin";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/v1/words/[id]  { word?, difficulty?, category? }  — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const allowed = ["word", "difficulty", "category"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  await connectDB();
  const updated = await Word.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Word not found" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

// DELETE /api/v1/words/[id]  — admin only
export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
  }

  await connectDB();
  const deleted = await Word.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Word not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
