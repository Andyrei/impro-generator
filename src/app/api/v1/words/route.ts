import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongodb';
import Word from '@/lib/db/models/word';
import { IWord } from '@/lib/db/types/word';

// Define the handler for the GET request
export async function GET(req: NextRequest) {
  
  const level = req.nextUrl.searchParams.get('level') ? req.nextUrl.searchParams.get('level') : null
  const action = req.nextUrl.searchParams.get('action') ? req.nextUrl.searchParams.get('action') : 'all'
  
  // Define the range of levels based on the query parameter 'level'
  let levelRange: {$lte: number} | {$gte: number, $lte: number} | {$gte: number, $lte: number} | undefined;
  if (level) {
    switch (level) {
      case '1':
        levelRange =  {$lte: 33}
        break
      case '2':
        levelRange =  {$gte: 33, $lte: 66}
        break
      case '3':
        levelRange =  {$gte: 66, $lte: 100}
        break
    }
  }
  
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

    // Construct query
    const query: any = {};
    
    // Add category filter if action is not 'all'
    if (action !== 'all') {
      if (action && !mongoose.Types.ObjectId.isValid(action)) {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        );
      }
      query.category = action && new mongoose.Types.ObjectId(action);
    }

    // Add difficulty filter if level is specified
    if (levelRange) {
      query.difficulty = levelRange;
    }

    const words: IWord[] = await Word.find().where(query).exec();
    
    return NextResponse.json({ metadata: {
      total: words.length,
      actiom: action,
      level: {
        range: levelRange,
        value: level
      }
    }, data: words,  }, { status: 200 });

  } catch (error) {
    // Handle errors
    return NextResponse.json(
      { error: 'Failed to read', details: error },
      { status: 500 }
    );
  }

}