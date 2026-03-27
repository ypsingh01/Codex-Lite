import mongoose, { type InferSchemaType } from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    durationMins: { type: Number, default: 60 },
    meetLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    roomId: { type: String, unique: true, required: true },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export type InterviewDocument = InferSchemaType<typeof interviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Interview =
  (mongoose.models.Interview as mongoose.Model<InterviewDocument>) ||
  mongoose.model<InterviewDocument>("Interview", interviewSchema);

