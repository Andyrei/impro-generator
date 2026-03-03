// src/lib/db/seed/seedFromCsv.ts
/**
 * CSV Seeder — seeds words from a CSV file into MongoDB
 *
 * Usage:
 *   npx tsx src/lib/db/seed/seedFromCsv.ts <csvFilePath> <categoryNameEn>
 *
 * Arguments:
 *   csvFilePath     - Path to the CSV file, relative to project root
 *   categoryNameEn  - English name of the category to assign words to (case-insensitive)
 *
 * Examples:
 *   npx tsx src/lib/db/seed/seedFromCsv.ts  assets/wordlist/characters.csv Characters 
 *   npx tsx src/lib/db/seed/seedFromCsv.ts assets/wordlist/places.csv Place
 *   npx tsx src/lib/db/seed/seedFromCsv.ts assets/wordlist/situations.csv Situation
 *
 * CSV Format:
 *   - Required column : en (English word, used as unique key for duplicate check)
 *   - Optional columns: any language code that exists in your DB (it, ro, fr, es, ...)
 *   - Optional column : difficulty (integer 0-100, defaults to 30 if missing)
 *   - Optional column : id (ignored, MongoDB generates its own _id)
 *
 *   Example:
 *     id,en,it,ro,fr,es,difficulty
 *     1,Vampire,Vampiro,Vampir,Vampire,Vampiro,60
 *     2,Pirate,Pirata,,Pirate,,40   ← missing ro/es is fine, just skipped
 *
 * Behavior:
 *   - Words already in the DB (matched by word.en) are skipped, not overwritten
 *   - Only languages with a non-empty value in the row are added to availableLanguages
 *   - Language codes are resolved dynamically from the DB, no hardcoding needed
 *   - The entire operation runs in a MongoDB transaction — all or nothing
 */

import mongoose, { ClientSession } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { connectDB } from "../mongodb";
import Category from "../models/category";
import Language from "../models/language";
import Word from "../models/word";

interface CSVRecord {
  id?: string;
  difficulty: string;
  [key: string]: string | undefined; // allows dynamic language code columns (en, it, ro, fr, es...)
}

const [,, csvFilePath, categoryNameEn] = process.argv;
const forceUpdate = process.argv.includes('--force');

if (!csvFilePath || !categoryNameEn) {
  console.error('Usage: npx tsx src/lib/db/seed/seedFromCsv.ts <csvFilePath> <categoryNameEn>');
  process.exit(1);
}

async function seedFromCSV(): Promise<void> {
  let session: ClientSession | undefined;

  try {
    await connectDB();
    console.log('Connected to the database!');

    const absolutePath = path.resolve(csvFilePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CSVRecord[];
    console.log(`Parsed ${records.length} records from ${csvFilePath}`);

    session = await mongoose.startSession();
    session.startTransaction();

    const category = await Category.findOne(
      { 'name.en': { $regex: new RegExp(`^${categoryNameEn}$`, 'i') } },
      null,
      { session }
    );

    console.log(category?.name);
    
    if (!category) {
      throw new Error(`Category "${categoryNameEn}" not found in the database.`);
    }
    console.log(`Using category: ${(category.name as any).get("en")} (${category._id})`);

    const languages = await Language.find({}, null, { session });
    const languageIds = languages.map((l) => l._id);

    let newCount = 0;
    let skippedCount = 0;
    const wordOps: mongoose.AnyBulkWriteOperation[] = [];

    for (const record of records) {
        const engWord = record.en;
        const itaWord = record.it;
        const difficulty = parseInt(record.difficulty as string, 10);

        if (!engWord) {
            console.warn('Skipping row with missing English word:', record);
            continue;
        }

        const existing = await Word.findOne({ 'word.en': engWord }, null, { session });

        if (existing && !forceUpdate) {
            console.log(`  [SKIP] "${engWord}" already exists.`);
            skippedCount++;
            continue;
        }

        wordOps.push({
            updateOne: {
            filter: { 'word.en': engWord },
            update: {
                $set: {
                word: { en: engWord, it: itaWord },
                category: category._id,
                difficulty,
                availableLanguages: languageIds,
                },
            },
            upsert: true,
            },
        });
        newCount++;
    }

    if (wordOps.length > 0) {
      await Word.bulkWrite(wordOps, { session });
    }

    await session.commitTransaction();
    console.log(`\nDone! Inserted: ${newCount} | Skipped (duplicates): ${skippedCount}`);

  } catch (error) {
    console.error('Error seeding from CSV:', error);
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

(async () => {
  await seedFromCSV();
  process.exit(0);
})();
