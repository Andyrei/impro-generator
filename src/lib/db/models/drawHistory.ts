import mongoose, { Schema, Model, Types } from "mongoose";

export interface IDrawHistory {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  wordId: Types.ObjectId;
  categoryId: Types.ObjectId;
  sessionId: string;
  drawnAt?: Date;
}

const DrawHistorySchema = new Schema<IDrawHistory>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  wordId: { type: Schema.Types.ObjectId, ref: "Word", required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  sessionId: { type: String, required: true },
  drawnAt: { type: Date, default: Date.now },
});

// Auto-delete after 90 days
DrawHistorySchema.index({ drawnAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
DrawHistorySchema.index({ userId: 1, drawnAt: -1 });

const DrawHistory: Model<IDrawHistory> =
  mongoose.models.DrawHistory ||
  mongoose.model<IDrawHistory>("DrawHistory", DrawHistorySchema);

export default DrawHistory;
