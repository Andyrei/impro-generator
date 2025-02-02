import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';


// Define the handler for the GET request
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