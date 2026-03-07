import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";

// GET /api/v1/settings — returns current user's settings
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById((session.user as any).id, "settings").lean();

  return NextResponse.json({ settings: user?.settings ?? {} });
}

// PATCH /api/v1/settings  { language?, theme?, stopwatchTimeFormat?, stopwatchPreventSleep?, favoriteCategories? }
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const allowed = ["language", "theme", "stopwatchTimeFormat", "stopwatchPreventSleep", "favoriteCategories"];
  const update: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) update[`settings.${key}`] = body[key];
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(
    (session.user as any).id,
    { $set: update },
    { new: true, select: "settings" }
  ).lean();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ settings: user.settings });
}
