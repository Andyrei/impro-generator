import mongoose, { Schema, Model, Types } from "mongoose";

export type SuggestionStatus = "pending" | "approved" | "rejected";

export type Difficulty = "easy" | "medium" | "hard";

export interface IWordSuggestion {
  _id?: Types.ObjectId;
  word: { [langCode: string]: string };
  category: Types.ObjectId;
  difficulty: Difficulty;
  suggestedBy?: Types.ObjectId | null;
  ip?: string | null;
  status: SuggestionStatus;
  reviewedBy?: Types.ObjectId | null;
  createdAt?: Date;
}

const WordSuggestionSchema = new Schema<IWordSuggestion>(
  {
    word: { type: Map, of: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    suggestedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    ip: { type: String, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

WordSuggestionSchema.index({ status: 1 });

const WordSuggestion: Model<IWordSuggestion> =
  mongoose.models.WordSuggestion ||
  mongoose.model<IWordSuggestion>("WordSuggestion", WordSuggestionSchema);

export default WordSuggestion;
