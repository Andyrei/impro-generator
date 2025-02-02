import mongoose from 'mongoose';
import { connectDB } from "../mongodb";
import Category from "../models/category";
import Language from "../models/language";
import Word from "../models/word";


async function seedDatabase() {
    let session;
  try {
    // Connect to the DB
    await connectDB();
    console.log("Connected to the database!");
    
    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Create languages first and store references
    // Upsert languages
    const languageOps = [
        { code: "it", name: "Italian", default: true },
        { code: "en", name: "English", default: false },
        { code: "ro", name: "Romanian", default: false },
        { code: "fr", name: "French", default: false },
        { code: "es", name: "Spanish", default: false }
    ].map(lang => ({
        updateOne: {
        filter: { code: lang.code },
        update: { $set: lang },
        upsert: true
        }
    }));
    await Language.bulkWrite(languageOps, { session });

    const languages = await Language.find({}, null, { session });
    console.log(`Created ${languages.length} languages`);
    

    // Create categories
    const categoryOps = [
            { 
                name: {
                    it:"Luogo",
                    en: "Place"
                }, 
                description: "Locations and geographical places" 
            },
            { 
                name: {
                    it: "Situazione",
                    en: "Situation"
                }, 
                description: "Various situations for improv" 
            },
            { 
                name: {
                    it: "Relazione",
                    en: "Relation"
                }, 
                description: "Relation between characters" 
            },
            { 
                name: {
                    it: "Personaggi",
                    en: "Characters"
                }, 
                description: "Characters for the scene" 
            }
    ].map(cat => ({
                updateOne: {
                filter: { 'name.it': cat.name.it },
                update: { $set: cat },
                upsert: true
                }
    }));
    await Category.bulkWrite(categoryOps, { session });

    // Get updated categories for reference
    const categoryDocs = await Category.find({}, null, { session });
    console.log(`Created ${categoryDocs.length} categories`);


    // Create words
    const wordOps = [
      {
        word: { en: "Park", it: "Parco", ro: "Parc", fr: "Parc", es: "Parque" },
        category: categoryDocs[0]._id, // Referencing "Places"
        difficulty: 30,
        availableLanguages: languages.map((lang) => lang._id),
      },
      {
        word: { en: "Mountain", it: "Montagna", ro: "Munte", fr: "Montagne", es: "Montaña" },
        category: categoryDocs[0]._id, // Referencing "Places"
        difficulty: 50,
        availableLanguages: languages.map((lang) => lang._id),
      }
    ].map(word => ({
        updateOne: {
          filter: { 'word.en': word.word.en },
          update: { $set: word },
          upsert: true
        }
    }));
    await Word.bulkWrite(wordOps, { session });

    console.log(`Created ${wordOps.length} words`);

    // Commit the transaction
    await session.commitTransaction();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Self-executing function to run the seed
(async () => {
    await seedDatabase();
    process.exit(0);
  })();