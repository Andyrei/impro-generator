import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import WordSuggestion from "@/lib/db/models/wordSuggestion";
import Word from "@/lib/db/models/word";
import { isAdmin } from "@/lib/isAdmin";

type Params = { params: Promise<{ id: string }> };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeItalianWord(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getItalianWord(word: unknown): string | null {
  if (!word || typeof word !== "object") return null;

  if (word instanceof Map) {
    return normalizeItalianWord(word.get("it"));
  }

  return normalizeItalianWord((word as Record<string, unknown>).it);
}

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
    const italianWord = getItalianWord(suggestion.word);
    if (italianWord) {
      const existingWord = await Word.findOne({
        "word.it": { $regex: `^${escapeRegex(italianWord)}$`, $options: "i" },
      })
        .select("_id word")
        .lean();

      if (existingWord) {
        return NextResponse.json(
          {
            error: "La parola esiste gia nel database. Rifiuta il suggerimento invece di approvarlo.",
            existingWordId: String((existingWord as any)._id),
          },
          { status: 409 }
        );
      }
    }

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
