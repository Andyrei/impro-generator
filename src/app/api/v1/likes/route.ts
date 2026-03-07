import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import Like from "@/lib/db/models/like";

// GET /api/v1/likes?wordIds=id1,id2
// Returns { [wordId]: boolean } — liked status for the given word IDs
export async function GET(req: NextRequest) {
  const wordIdsParam = req.nextUrl.searchParams.get("wordIds") ?? "";
  const wordIds = wordIdsParam
    .split(",")
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!wordIds.length) {
    return NextResponse.json({});
  }

  const session = await auth();
  const anonId = req.headers.get("x-anon-id");

  await connectDB();

  const filter = session?.user
    ? { wordId: { $in: wordIds }, userId: (session.user as any).id }
    : anonId
    ? { wordId: { $in: wordIds }, anonId }
    : null;

  if (!filter) return NextResponse.json({});

  const likes = await Like.find(filter, "wordId");
  const result: Record<string, boolean> = {};
  for (const like of likes) {
    result[like.wordId.toString()] = true;
  }
  return NextResponse.json(result);
}

// POST /api/v1/likes  { wordId }
// Toggles the like — adds if not present, removes if already liked
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { wordId } = body;

  if (!wordId || !mongoose.isValidObjectId(wordId)) {
    return NextResponse.json({ error: "Invalid wordId" }, { status: 400 });
  }

  const session = await auth();
  const anonId = req.headers.get("x-anon-id");

  if (!session?.user && !anonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const wordObjectId = new mongoose.Types.ObjectId(wordId);
  const filter = session?.user
    ? { wordId: wordObjectId, userId: (session.user as any).id }
    : { wordId: wordObjectId, anonId };

  const existing = await Like.findOne(filter);
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    return NextResponse.json({ liked: false });
  }

  await Like.create({
    wordId: wordObjectId,
    userId: session?.user ? (session.user as any).id : null,
    anonId: session?.user ? null : anonId,
  });
  return NextResponse.json({ liked: true });
}
