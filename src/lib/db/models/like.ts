import mongoose, { Schema, Model, Types } from "mongoose";

export interface ILike {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId | null;
  wordId: Types.ObjectId;
  anonId?: string | null;
  createdAt?: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    wordId: { type: Schema.Types.ObjectId, ref: "Word", required: true },
    anonId: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate likes: one per logged-in user per word
LikeSchema.index({ userId: 1, wordId: 1 }, { unique: true, sparse: true });
// Prevent duplicate likes: one per anonymous device per word
LikeSchema.index({ anonId: 1, wordId: 1 }, { unique: true, sparse: true });

const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);

export default Like;
