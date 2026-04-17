import * as z from 'zod';
import { Schema } from 'mongoose';
import { applicationStatuses } from "../config/constants.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
// const objectIdSchema = z.string().regex(objectIdRegex, "Invalid MongoDB ID");
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid MongoDB ID") as unknown as z.ZodType<Schema.Types.ObjectId>;

export const applicationTimelineValidationSchema = z.object({
  status: z.enum(applicationStatuses).default('draft'),
  note: z.string().optional() 
});

export type ApplicationTimelineType = z.infer<typeof applicationTimelineValidationSchema>

export const createApplicationSchema = z.object({
  student: objectIdSchema,
  program: objectIdSchema,
  university: objectIdSchema,
  destinationCountry: z.string().min(1, "Country is required"),
  intake: z.string().min(1, "Intake is required"),
  status: z.enum(applicationStatuses).default('draft'),
  timeline: z.array(applicationTimelineValidationSchema).default([{ status: "draft", note: "Application created." }])
});

export type CreateApplicationType = z.infer<typeof createApplicationSchema>;
