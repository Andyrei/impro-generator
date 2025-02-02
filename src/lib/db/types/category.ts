export interface ICategory extends Document {
    name: { [languageCode: string]: string };
    description?: { [languageCode: string]: string };
  }
  