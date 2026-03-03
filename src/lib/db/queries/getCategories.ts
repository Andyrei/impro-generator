import { cache } from 'react';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';
import Word from '@/lib/db/models/word';
import { ICategory, ICategoryDocument } from '@/lib/db/types/category';

export const getCategories = cache(async (): Promise<ICategory[]> => {
    const toPlainObject = (val: any) => val instanceof Map ? Object.fromEntries(val) : val;
    await connectDB();
    const raw = await Category.find();
    return await Promise.all(
        raw.map(async (cat: ICategoryDocument) => {
            const wordCount = await Word.countDocuments({ category: cat._id });
            const obj = cat.toObject();

            return { 
                _id: obj._id.toString(),
                name: toPlainObject(obj.name),
                description: toPlainObject(obj.description),
                wordCount,
            } satisfies ICategory;
        })
    );
});