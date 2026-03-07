import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import DrawHistory from "@/lib/db/models/drawHistory";

// POST /api/v1/history  { wordId, categoryId, sessionId }  — fire-and-forget from client
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { wordId, categoryId, sessionId } = body;

  if (
    !wordId || !mongoose.isValidObjectId(wordId) ||
    !categoryId || !mongoose.isValidObjectId(categoryId) ||
    !sessionId || typeof sessionId !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();

  await DrawHistory.create({
    userId: (session.user as any).id,
    wordId: new mongoose.Types.ObjectId(wordId),
    categoryId: new mongoose.Types.ObjectId(categoryId),
    sessionId,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

// GET /api/v1/history  — returns last 50 draws for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const history = await DrawHistory.find({ userId: (session.user as any).id })
    .sort({ drawnAt: -1 })
    .limit(50)
    .populate("wordId", "word")
    .populate("categoryId", "name")
    .lean();

  return NextResponse.json({ data: history });
}
