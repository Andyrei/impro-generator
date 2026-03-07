import { Types } from "mongoose";

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export interface IWord extends Document {
    _id?: Types.ObjectId;
    word: { [languageCode: string]: string }; // Multi-language words
    category: Types.ObjectId; // Reference to Category
    difficulty: Difficulty;
    availableLanguages: Types.ObjectId[]; // References to Language schema
    createdBy?: Types.ObjectId; // Optional reference to User schema
  }