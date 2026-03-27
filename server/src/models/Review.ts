import mongoose, { type InferSchemaType } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    problemSolvingScore: { type: Number, min: 1, max: 10, required: true },
    codeQualityScore: { type: Number, min: 1, max: 10, required: true },
    optimizationScore: { type: Number, min: 1, max: 10, required: true },
    communicationScore: { type: Number, min: 1, max: 10, required: true },
    writtenFeedback: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Review =
  (mongoose.models.Review as mongoose.Model<ReviewDocument>) ||
  mongoose.model<ReviewDocument>("Review", reviewSchema);

