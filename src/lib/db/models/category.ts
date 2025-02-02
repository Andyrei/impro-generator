import mongoose, { Schema, Document, Model } from "mongoose";
import { ICategory } from "../types/category";


const CategorySchema = new Schema<ICategory>({
  name: { type: Map, of: String, required: true, unique: true },
  description: { type: mongoose.Schema.Types.Mixed }, // Optional field for extra details
});

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;