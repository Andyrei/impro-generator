import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import WordSuggestion from "@/lib/db/models/wordSuggestion";
import { isAdmin } from "@/lib/isAdmin";
import { getClientIp } from "@/lib/rateLimit";
import { Difficulty, DIFFICULTIES } from "@/lib/db/types/word";

const ANON_SUGGESTION_LIMIT = 10;

// POST /api/v1/suggestions  { word: {en, it, ...}, category, difficulty }
// Anyone can submit a word suggestion (anonymous or logged in)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { word, category, difficulty } = body;

  if (!word || typeof word !== "object" || !category || !difficulty) {
    return NextResponse.json({ error: "Missing required fields: word, category, difficulty" }, { status: 400 });
  }

  if (!mongoose.isValidObjectId(category)) {
    return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
  }

  if (!DIFFICULTIES.includes(difficulty as Difficulty)) {
    return NextResponse.json(
      { error: `difficulty must be one of: ${DIFFICULTIES.join(", ")}` },
      { status: 400 }
    );
  }

  const session = await auth();
  await connectDB();

  let ip: string | null = null;

  if (!session?.user) {
    ip = getClientIp(req);
    // include legacy ::1 entries so existing dev docs are still counted
    const ipVariants = ip === '127.0.0.1' ? ['127.0.0.1', '::1'] : [ip];
    const count = await WordSuggestion.countDocuments({ ip: { $in: ipVariants }, suggestedBy: null });
    const date_last_insertedAt = await WordSuggestion.findOne({ ip: { $in: ipVariants }, suggestedBy: null }).sort({ createdAt: -1 }).select('createdAt').lean();

    // Limit to ANON_SUGGESTION_LIMIT suggestions per 24h for anonymous users (identified by IP)
    if (count >= ANON_SUGGESTION_LIMIT && date_last_insertedAt && date_last_insertedAt.createdAt && (Date.now() - new Date(date_last_insertedAt.createdAt).getTime()) < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: `Puoi inviare al massimo ${ANON_SUGGESTION_LIMIT} suggerimenti senza essere registrato.` },
        { status: 429 }
      );
    }
  }

  const suggestion = await WordSuggestion.create({
    word,
    category: new mongoose.Types.ObjectId(category),
    difficulty: difficulty as Difficulty,
    suggestedBy: session?.user ? (session.user as any).id : null,
    ip,
    status: "pending",
  });

  return NextResponse.json({ id: suggestion._id }, { status: 201 });
}

// GET /api/v1/suggestions?status=pending  — admin only
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const statusParam = req.nextUrl.searchParams.get("status") ?? "pending";
  await connectDB();

  const suggestions = await WordSuggestion.find({ status: statusParam })
    .populate("category", "name")
    .populate("suggestedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ data: suggestions });
}
