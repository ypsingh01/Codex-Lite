import mongoose, { type InferSchemaType } from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    examples: { type: [exampleSchema], default: [] },
    constraints: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export type QuestionDocument = InferSchemaType<typeof questionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Question =
  (mongoose.models.Question as mongoose.Model<QuestionDocument>) ||
  mongoose.model<QuestionDocument>("Question", questionSchema);

