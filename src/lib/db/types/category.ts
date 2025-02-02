export interface ICategory extends Document {
    _id?: string;
    name: { [languageCode: string]: string };
    description?: { [languageCode: string]: string };
  }
  