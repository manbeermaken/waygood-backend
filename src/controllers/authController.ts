import jwt, { type SignOptions } from "jsonwebtoken";
import HttpError from "../utils/httpError.js";
import Student from "../models/Student.js";
import { StudentValidationSchema } from "../validations/student.validation.js";
import * as z from "zod";
import config from "../config/config.js";
import { type RequestHandler } from "express";

const StudentLoginValidationSchema = StudentValidationSchema.pick({
  email: true,
  password: true,
  role: true,
});

function generateTokens(id: string, role: string) {
  const expiresIn = config.JWT_EXPIRES_IN as SignOptions["expiresIn"];
  const token = jwt.sign({ id, role }, config.JWT_SECRET, {
    expiresIn,
  });
  return token;
}

export const register: RequestHandler = async (req, res) => {
  const studentValidation = StudentValidationSchema.safeParse(req.body);
  if (!studentValidation.success) {
    const errors = z.flattenError(studentValidation.error).fieldErrors;
    throw new HttpError(422, "Validation Failed", errors);
  }

  const newStudent = await Student.create(studentValidation.data);
  const token = generateTokens(newStudent._id.toString(), newStudent.role);

  res.status(201).json({
    success: true,
    token,
  });
};

export const login: RequestHandler = async (req, res) => {
  const studentValidation = StudentLoginValidationSchema.safeParse(req.body);
  if (!studentValidation.success) {
    const errors = z.flattenError(studentValidation.error).fieldErrors;
    throw new HttpError(422, "Validation Failed", errors);
  }

  const student = await Student.findOne({
    email: studentValidation.data.email,
  });
  if (
    !student ||
    !(await student.comparePassword(studentValidation.data.password))
  ) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = generateTokens(student._id.toString(), student.role);
  res.status(201).json({
    success: true,
    token,
  });
};

export const me: RequestHandler = async (req, res) => {
  const { id, role } = req;
  const student = await Student.findById(id).select("-password").lean();

  if (!student) {
    throw new HttpError(401, "Authenticated user no longer exists.");
  }
  res.status(200).json({
    success: true,
    data: student,
  });
};
