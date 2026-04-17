import type { RequestHandler } from "express";
import { buildProgramRecommendations } from "../services/recommendationService.js";
import HttpError from "../utils/httpError.js";

export const getRecommendations: RequestHandler = async (req, res) => {
  const { studentId } = req.params;

  if (typeof studentId !== "string") {
    throw new HttpError(
      422,
      "Validation Error: studentId must be a single string",
    );
  }

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(studentId)) {
    throw new HttpError(422, "Validation Error");
  }

  const payload = await buildProgramRecommendations(studentId);

  res.json({
    success: true,
    ...payload,
  });
};
