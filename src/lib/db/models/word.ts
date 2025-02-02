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
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  availableLanguages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Language",
    },
  ],
});

const Word: Model<IWord> =
  mongoose.models.Word || mongoose.model<IWord>("Word", WordSchema);

export default Word;