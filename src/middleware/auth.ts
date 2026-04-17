import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";

import config from "../config/config.js";
import Student from "../models/Student.js";
import HttpError from "../utils/httpError.js";
import type { RequestHandler } from "express";

interface CustomJwtPayload extends JwtPayload {
  id: string;
  username: string;
}

const requireAuth: RequestHandler = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Authorization token missing.");
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();
  const decoded = jwt.verify(
    token,
    config.JWT_SECRET,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err || !decoded) {
        throw new HttpError(401, "Invalid or expired token.");
      }
      const payload = decoded as CustomJwtPayload;
      req.id = payload.id;
      req.role = payload.role;

      next();
    },
  );
  // const student = await StudentModel.findById(decoded.sub).select("-password");

  // if (!student) {
  //   throw new HttpError(401, "Authenticated user no longer exists.");
  // }
};

export { requireAuth };
