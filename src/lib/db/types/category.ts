import { Document } from 'mongoose';

// Use this in your Mongoose model/schema definition
export interface ICategoryDocument extends Document {
  name: { [languageCode: string]: string };
  description?: { [languageCode: string]: string };
}

// Use this when passing data to Client Components
export interface ICategory {
  _id: string;
  name: { [languageCode: string]: string };
  description?: { [languageCode: string]: string };
  wordCount?: number;
}