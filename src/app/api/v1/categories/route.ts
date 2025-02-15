import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';




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
        console.log("Connected to the database!");
    
        // Get all categories
        const categories = await Category.find();
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
        );
    }
}