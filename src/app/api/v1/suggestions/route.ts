import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import WordSuggestion from "@/lib/db/models/wordSuggestion";
import Word from "@/lib/db/models/word";
import { isAdmin } from "@/lib/isAdmin";

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

  if (![1, 2, 3].includes(Number(difficulty))) {
    return NextResponse.json({ error: "difficulty must be 1, 2, or 3" }, { status: 400 });
  }

  const session = await auth();
  await connectDB();

  const suggestion = await WordSuggestion.create({
    word,
    category: new mongoose.Types.ObjectId(category),
    difficulty: Number(difficulty),
    suggestedBy: session?.user ? (session.user as any).id : null,
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
