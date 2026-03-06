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

    const sampleParam = req.nextUrl.searchParams.get('sample');
    if (sampleParam === '1') {
      const excludeParam = req.nextUrl.searchParams.get('exclude') ?? '';
      const excludeIds = excludeParam
        .split(',')
        .filter(id => mongoose.isValidObjectId(id))
        .map(id => new mongoose.Types.ObjectId(id));

      const pipeline: any[] = [{ $match: query }];
      if (excludeIds.length > 0) {
        pipeline.push({ $match: { _id: { $nin: excludeIds } } });
      }
      pipeline.push({ $sample: { size: 1 } });

      const [word] = await Word.aggregate(pipeline);
      return NextResponse.json(
        { data: word ? [word] : [] },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam) || 50, 1), 200) : null;

    const words = limit
      ? await Word.find(query).limit(limit)
      : await Word.find(query);

    return NextResponse.json(
      {
        metadata: {
          total: words.length,
          action: actionParam,
          level: { value: levelParam, range: levelRange },
          ...(limit !== null && { limit }),
        },
        data: words,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read', details: error },
      { status: 500 }
    );
  }
}