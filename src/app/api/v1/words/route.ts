import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongodb';
import Word from '@/lib/db/models/word';
import type { Difficulty } from '@/lib/db/types/word';
import type { FilterQuery } from 'mongoose';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Accepts 'easy'|'medium'|'hard' directly, or legacy numeric '1'|'2'|'3'
const LEVEL_ALIAS: Record<string, Difficulty> = {
  easy: 'easy', medium: 'medium', hard: 'hard',
};

export async function GET(req: NextRequest) {
  const { ok, retryAfter } = rateLimit(getClientIp(req));
  if (!ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const levelParam = req.nextUrl.searchParams.get('level');
  const actionParam = req.nextUrl.searchParams.get('action') ?? 'all';

  let difficulty: Difficulty | undefined;
  if (levelParam) {
    difficulty = LEVEL_ALIAS[levelParam];
    if (!difficulty) {
      return NextResponse.json(
        { error: 'Invalid level parameter. Use easy, medium, hard (or 1, 2, 3).' },
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
    await connectDB();

    const query: FilterQuery<typeof Word> = {};
    if (actionParam !== 'all') {
      query.category = new mongoose.Types.ObjectId(actionParam);
    }
    if (difficulty) {
      // Support both string ('easy'/'medium'/'hard') and legacy numeric values in DB
      (query as any).$or = [{ difficulty }, { difficulty: Object.keys(LEVEL_ALIAS).find(key => LEVEL_ALIAS[key] === difficulty) }];
    }

    // Optional keyword search across all language fields
    const searchParam = req.nextUrl.searchParams.get('search');
    if (searchParam) {
      const re = { $regex: searchParam, $options: 'i' };
      (query as any).$and = [
        ...((query as any).$and ?? []),
        { $or: [{ 'word.it': re }, { 'word.en': re }] },
      ];
    }

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
    const pageParam  = req.nextUrl.searchParams.get('page');
    const pageSize   = Math.min(Math.max(parseInt(limitParam || '50') || 50, 1), 200);

    // Paginated path — used by the browse/admin table
    if (pageParam !== null) {
      const page = Math.max(1, parseInt(pageParam) || 1);
      const skip = (page - 1) * pageSize;

      // Sorting — ?sort=word.it|difficulty  ?sortDir=asc|desc
      const sortField = req.nextUrl.searchParams.get('sort') ?? 'word.it';
      const sortDir   = req.nextUrl.searchParams.get('sortDir') === 'desc' ? -1 : 1;
      const allowedSortFields = ['word.it', 'word.en', 'word.ro', 'difficulty'];
      const mongoSort: Record<string, 1 | -1> = {};
      if (sortField === 'difficulty') {
        // Sort by logical order using aggregation
        const diffOrder = { $switch: { branches: [
          { case: { $eq: ['$difficulty', 'easy']   }, then: 1 },
          { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
          { case: { $eq: ['$difficulty', 'hard']   }, then: 3 },
        ], default: 0 } };
        const [words, total] = await Promise.all([
          Word.aggregate([
            { $match: query },
            { $addFields: { _diffOrder: diffOrder } },
            { $sort: { _diffOrder: sortDir } },
            { $skip: skip },
            { $limit: pageSize },
          ]),
          Word.countDocuments(query),
        ]);
        return NextResponse.json(
          { metadata: { total, page, pageSize, pages: Math.ceil(total / pageSize) }, data: words },
          { status: 200, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      mongoSort[allowedSortFields.includes(sortField) ? sortField : 'word.it'] = sortDir;
      const [words, total] = await Promise.all([
        Word.find(query).sort(mongoSort).skip(skip).limit(pageSize),
        Word.countDocuments(query),
      ]);
      return NextResponse.json(
        { metadata: { total, page, pageSize, pages: Math.ceil(total / pageSize) }, data: words },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Non-paginated path — kept for backwards compatibility
    const limit = limitParam ? pageSize : null;
    const words = limit
      ? await Word.find(query).limit(limit)
      : await Word.find(query);

    return NextResponse.json(
      {
        metadata: {
          total: words.length,
          action: actionParam,
          level: { value: levelParam, difficulty },
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
    console.error('[/api/v1/words]', error);
    return NextResponse.json(
      { error: 'Failed to fetch words' },
      { status: 500 }
    );
  }
}