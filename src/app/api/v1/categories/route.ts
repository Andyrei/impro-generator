import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';
import Word from '@/lib/db/models/word';




/* 
    Define requests of the categories that are the buttons inside the app like Place, Relation,... etc
*/

//GET  api/v1/categories
export async function GET(req: NextRequest) {

    try {
        // Connect to the DB
        await connectDB();
        if (mongoose.connection.readyState !== 1) {
            return NextResponse.json(
                { error: 'Failed to connect to the database' },
                { status: 500 }
            );
        }
    
        // Get all categories
        const categories = await Category.find();

        const categoriesWithWordCount = await Promise.all(
            categories.map(async (category) => {
                const wordCount = await Word.countDocuments({ category: category._id })

                // turn mongoose document → plain object so we can mutate it
                const obj = category.toObject();

                // assign name as-is since it's already a plain object
                obj.name = category.name;   // { it: '…', en: '…' }

                return { ...obj, wordCount };
            })
        );
        
        return NextResponse.json(categoriesWithWordCount);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
        { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
        );
    }
}