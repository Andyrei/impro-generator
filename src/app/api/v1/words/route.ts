import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongodb';
import Word from '@/lib/db/models/word';
import type { IWord } from '@/lib/db/types/word';
import type { FilterQuery } from 'mongoose';


const breaks = [0, 33, 66, 100];
function rangeForLevel(n: number) {
  const lo = breaks[(n - 1)] ?? 0;
  const hi = breaks[n] ?? 100;
  return { $gte: lo, $lte: hi };
}


export async function GET(req: NextRequest) {
  const levelParam = req.nextUrl.searchParams.get('level');
  const actionParam = req.nextUrl.searchParams.get('action') ?? 'all';

  // map of allowed levels → difficulty query
  const levelMap: Record<string, FilterQuery<IWord>['difficulty']> = {};

  let levelRange;
  if (levelParam) {
    levelRange = rangeForLevel(parseInt(levelParam));
    if (!levelRange) {
      return NextResponse.json(
        { error: 'Invalid level parameter' },
        { status: 400 }
      );
    }
  }

  if (actionParam !== 'all' && !mongoose.isValidObjectId(actionParam)) {
    return NextResponse.json(
      { error: 'Invalid category ID' },
      { status: 400 }
    );
  }

  try {
    await connectDB();                // connection is cached internally
    // no readyState check needed

    const query: FilterQuery<IWord> = {};
    if (actionParam !== 'all') {
      query.category = new mongoose.Types.ObjectId(actionParam);
    }
    if (levelRange) query.difficulty = levelRange;

    const words = await Word.find(query); // simple find with object

    return NextResponse.json(
      {
        metadata: {
          total: words.length,
          action: actionParam,          // fixed typo
          level: { value: levelParam, range: levelRange },
        },
        data: words,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read', details: error },
      { status: 500 }
    );
  }
}