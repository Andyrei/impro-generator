import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import WordSuggestion from "@/lib/db/models/wordSuggestion";
import Word from "@/lib/db/models/word";
import { isAdmin } from "@/lib/isAdmin";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/v1/suggestions/[id]  { status: 'approved' | 'rejected' }  — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid suggestion ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { status } = body;
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  await connectDB();

  const suggestion = await WordSuggestion.findById(id);
  if (!suggestion) return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });

  if (status === "approved") {
    // Move to the words collection
    await Word.create({
      word: Object.fromEntries(suggestion.word as any),
      category: suggestion.category,
      difficulty: suggestion.difficulty,
      availableLanguages: [],
    });
  }

  suggestion.status = status;
  suggestion.reviewedBy = (session!.user as any).id;
  await suggestion.save();

  return NextResponse.json({ ok: true });
}
