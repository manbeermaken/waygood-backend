import bcrypt from "bcrypt";
import mongoose, { Schema, Model, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { type StudentBaseType } from "../validations/student.validation.js";

export interface IStudentDocument extends StudentBaseType, Document {
  createdAt: Date;
  updatedAt: Date;
}
interface IStudentMethods {
  comparePassword(password: string): Promise<boolean>;
}

type StudentModelType = Model<IStudentDocument, {}, IStudentMethods>;

const studentSchema = new Schema<
  IStudentDocument,
  StudentModelType,
  IStudentMethods
>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["student", "counselor"], default: "student" },
    targetCountries: { type: [String], default: undefined },
    interestedFields: { type: [String], default: undefined },
    preferredIntake: { type: String },
    maxBudgetUsd: { type: Number },
    englishTest: {
      exam: { type: String, default: "IELTS" },
      score: { type: Number, default: 0 },
    },
    profileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

studentSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.plugin(uniqueValidator, { message: "{PATH} already exists" });

studentSchema.methods.comparePassword = function comparePassword(
  password: string,
) {
  return bcrypt.compare(password, this.password);
};

const Student = mongoose.model<IStudentDocument, StudentModelType>(
  "Student",
  studentSchema,
);

export default Student