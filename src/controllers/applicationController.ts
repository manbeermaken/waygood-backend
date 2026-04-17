import * as z from "zod";
import Application from "../models/Application.js";
import HttpError from "../utils/httpError.js";
import {
  createApplicationSchema,
  applicationTimelineValidationSchema,
} from "../validations/application.validation.js";
import { mongo } from "mongoose";
import { validStatusTransitions } from "../config/constants.js";
import { type RequestHandler } from "express";

export const listApplications: RequestHandler = async (req, res) => {
  const { studentId, status } = req.query;
  const filters: any = {};

  if (studentId) {
    filters.student = studentId;
  }

  if (status) {
    filters.status = status;
  }

  const applications = await Application.find(filters)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: applications,
  });
};

export const createApplication: RequestHandler = async (req, res) => {
  const applicationValidation = createApplicationSchema.safeParse(req.body);
  if (!applicationValidation.success) {
    const errors = z.flattenError(applicationValidation.error).fieldErrors;
    throw new HttpError(422, "Validation Failed", errors);
  }

  try {
    const newApplication = await Application.create(applicationValidation.data);
    res.status(201).json({
      success: true,
      data: newApplication,
    });
  } catch (err) {
    if (err instanceof mongo.MongoServerError && err.code === 11000) {
      throw new HttpError(
        409,
        "An application for this student, program, and intake already exists.",
      );
    }
    throw new HttpError(500, "Internal server error");
  }
};

export const updateApplicationStatus: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const updateApplicationValidation =
    applicationTimelineValidationSchema.safeParse(req.body);

  if (!updateApplicationValidation.success) {
    const errors = z.flattenError(
      updateApplicationValidation.error,
    ).fieldErrors;
    throw new HttpError(422, "Validation Failed", errors);
  }

  const { status: newStatus, note } = updateApplicationValidation.data;
  const application = await Application.findById(id);
  if (!application) {
    throw new HttpError(404, "Application not found");
  }

  const currentStatus = application.status;

  const allowedNextStatuses = (validStatusTransitions[
    currentStatus as keyof typeof validStatusTransitions
  ] || []) as string[];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new HttpError(
      400,
      `Invalid status transition. Cannot move application from '${currentStatus}' to '${newStatus}'.`,
    );
  }

  application.status = newStatus;

  application.timeline.push({
    status: newStatus,
    note: note || `Application status updated to ${newStatus}.`,
  });

  await application.save();

  res.json({
    success: true,
    data: application,
  });
};