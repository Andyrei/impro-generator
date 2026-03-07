import mongoose, { Schema, Model, Types } from "mongoose";

export interface IUserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  stopwatchTimeFormat: string;
  stopwatchPreventSleep: boolean;
  favoriteCategories: Types.ObjectId[];
}

export interface IUser {
  _id?: Types.ObjectId;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  isAdmin: boolean;
  settings: IUserSettings;
}

const UserSettingsSchema = new Schema<IUserSettings>({
  language: { type: String, default: 'it' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  stopwatchTimeFormat: { type: String, default: 'mm:ss' },
  stopwatchPreventSleep: { type: Boolean, default: false },
  favoriteCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  emailVerified: { type: Date },
  image: { type: String },
  isAdmin: { type: Boolean, default: false },
  settings: { type: UserSettingsSchema, default: () => ({}) },
}, { timestamps: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;