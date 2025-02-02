import mongoose, { Schema, Document, Model } from "mongoose";
import { ILanguage } from "../types/language";

const LanguageSchema = new Schema<ILanguage>({
  code: { type: String, required: true, unique: true }, // "en", "fr", etc.
  name: { type: String, required: true }, // Full language name
});

const Language: Model<ILanguage> =
  mongoose.models.Language || mongoose.model<ILanguage>("Language", LanguageSchema);

export default Language;