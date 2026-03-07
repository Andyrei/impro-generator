import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import Like from "@/lib/db/models/like";

// POST /api/v1/likes/sync  { anonId, wordIds: string[] }
// Migrates anonymous likes to the authenticated user's account on login
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { anonId, wordIds } = body as { anonId?: string; wordIds?: string[] };

  if (!anonId || !Array.isArray(wordIds) || wordIds.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  const validWordIds = wordIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!validWordIds.length) return NextResponse.json({ synced: 0 });

  await connectDB();

  const userId = (session.user as any).id;

  // Transfer anon likes to this user, skipping any already liked by this user
  const anonLikes = await Like.find({ anonId, wordId: { $in: validWordIds } });

  let synced = 0;
  for (const like of anonLikes) {
    const alreadyLiked = await Like.exists({ userId, wordId: like.wordId });
    if (!alreadyLiked) {
      await Like.updateOne({ _id: like._id }, { $set: { userId, anonId: null } });
      synced++;
    } else {
      await Like.deleteOne({ _id: like._id });
    }
  }

  return NextResponse.json({ synced });
}
