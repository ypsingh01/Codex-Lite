import mongoose, { type InferSchemaType } from "mongoose";

const mockQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    difficulty: { type: String, default: "" },
  },
  { _id: false },
);

const aiFeedbackSchema = new mongoose.Schema(
  {
    approach: { type: String, default: "" },
    timeComplexity: { type: String, default: "" },
    spaceComplexity: { type: String, default: "" },
    codeQuality: { type: String, default: "" },
    optimizationSuggestions: { type: [String], default: [] },
    overallScore: { type: Number, default: 0 },
  },
  { _id: false },
);

const mockSessionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: { type: mockQuestionSchema, required: true },
    submittedCode: { type: String, default: "" },
    language: { type: String, default: "" },
    aiFeedback: { type: aiFeedbackSchema, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export type MockSessionDocument = InferSchemaType<typeof mockSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MockSession =
  (mongoose.models.MockSession as mongoose.Model<MockSessionDocument>) ||
  mongoose.model<MockSessionDocument>("MockSession", mockSessionSchema);

