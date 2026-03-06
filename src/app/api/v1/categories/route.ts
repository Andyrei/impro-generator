import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

/* 
    Define requests of the categories that are the buttons inside the app like Place, Relation,... etc
*/

//GET  api/v1/categories
export async function GET(req: NextRequest) {
    const { ok, retryAfter } = rateLimit(getClientIp(req));
    if (!ok) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        await connectDB();

        // Single aggregation: avoids N+1 by counting words per category in one DB round-trip
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'words',
                    let: { catId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$category', '$$catId'] } } },
                        { $count: 'n' },
                    ],
                    as: 'wordCountArr',
                },
            },
            {
                $addFields: {
                    wordCount: { $ifNull: [{ $arrayElemAt: ['$wordCountArr.n', 0] }, 0] },
                },
            },
            { $project: { wordCountArr: 0 } },
        ]);

        return NextResponse.json(categories, {
            headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}