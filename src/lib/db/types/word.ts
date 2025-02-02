import { Types } from "mongoose";

export interface IWord extends Document {
    _id?: Types.ObjectId;
    word: { [languageCode: string]: string }; // Multi-language words
    category: Types.ObjectId; // Reference to Category
    difficulty: number; // From 1 to 100
    availableLanguages: Types.ObjectId[]; // References to Language schema
  }