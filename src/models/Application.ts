import mongoose ,{ Schema, Model, Document } from "mongoose";
import { applicationStatuses } from "../config/constants.js";
import { type CreateApplicationType } from "../validations/application.validation.js";

export interface IApplicationDocument extends CreateApplicationType, Document {
  createdAt: Date;
  updatedAt: Date;
}
type ApplicationModelType = Model<IApplicationDocument,{}>

const applicationTimelineSchema = new Schema(
  {
    status: {
      type: String,
      enum: applicationStatuses,
      required: true,
    },
    note: String,
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const applicationSchema = new Schema<IApplicationDocument,ApplicationModelType>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    program: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
      index: true,
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    destinationCountry: {
      type: String,
      required: true,
      index: true,
    },
    intake: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: applicationStatuses,
      default: "draft",
      index: true,
    },
    timeline: {
      type: [applicationTimelineSchema],
      default: [{ status: "draft", note: "Application created." }],
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index(
  { student: 1, program: 1, intake: 1 },
  { unique: true },
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
