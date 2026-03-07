import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IWord } from "../types/word";

const WordSchema = new Schema<IWord>({
  word: {
    type: Map,
    of: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  availableLanguages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Language",
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false, // optional, to avoid breaking existing data
  },
});

WordSchema.index({ category: 1, difficulty: 1 }); // difficulty is now 'easy' | 'medium' | 'hard'
WordSchema.index({ 'word.it': 1 }, { unique: true });

const Word: Model<IWord> =
  mongoose.models.Word || mongoose.model<IWord>("Word", WordSchema);

export default Word;