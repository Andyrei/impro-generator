import { unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';
import { ICategory } from '@/lib/db/types/category';

const fetchCategories = async (): Promise<ICategory[]> => {
    const toPlainObject = (val: any) => val instanceof Map ? Object.fromEntries(val) : val;
    await connectDB();

    // Single aggregation: avoids N+1 by counting words per category in one DB round-trip
    const raw = await Category.aggregate([
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
    ]);

    return raw.map((doc) => ({
        _id: doc._id.toString(),
        name: toPlainObject(doc.name),
        description: toPlainObject(doc.description),
        wordCount: doc.wordCount,
    })) satisfies ICategory[];
};

// Cached across requests — revalidates every hour or on 'categories' tag invalidation
export const getCategories = unstable_cache(fetchCategories, ['categories'], {
    revalidate: 3600,
    tags: ['categories'],
});