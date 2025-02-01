import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

// Define the handler for the GET request
export async function GET(req: NextRequest) {
  
  const [level, action] = req.nextUrl.searchParams.values()

  const csvFilePath = path.join(process.cwd(), './assets/wordlist/', `${action}.csv`);
  
  
  const data: Record<string, string>[] = [];
  try {
    // Read the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => data.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Return the parsed data as JSON

  } catch (error) {
    // Handle errors
    return NextResponse.json(
      { error: 'Failed to read CSV file', details: error },
      { status: 500 }
    );
  }

    let export_data;
    switch (level) {
      case '1':
        export_data = data.filter((d)=>parseInt(d.difficulty) <= 33)
        break
      case '2':
        export_data = data.filter((d)=>(
          parseInt(d.difficulty) > 33 && parseInt(d.difficulty) <= 66
        ))
        break
      case '3':
        export_data = data.filter((d)=>(
          parseInt(d.difficulty) > 66 && parseInt(d.difficulty) <= 100
        ))
        break
    }
    
    return NextResponse.json(export_data)
}


export async function POST( req: NextRequest) {
  const [ action ] = req.nextUrl.searchParams.values()

  // Parse the request body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse request body', details: error },
      { status: 400 }
    );
  }

  const { theme, titleIT, titleEN, difficulty } = body;
  // Validate the request body
  if (!theme || !titleIT || !titleEN || !difficulty) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Define the path to the CSV file
  const csvFilePath = path.join(process.cwd(), './assets/wordlist/', `${action}.csv`);

  // Define an array to hold the data from the CSV file
  const data: Record<string, string>[] = [];

  // read the csv file and get the id of the last item so it can be incremented
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => data.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read CSV file', details: error },
      { status: 500 }
    );
  }

  const id = data.length + 1;

  // Add the new item to the data array
  let newData = [id.toString(), titleEN, titleIT, difficulty ];

  fs.appendFileSync(csvFilePath, '\n' + newData.join(','));  

  // Return the updated data
  return NextResponse.json(data);
}