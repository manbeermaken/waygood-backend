import Program from "../models/Program.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as z from "zod";
import HttpError from "../utils/httpError.js";

const searchQueriesSchema = z.object({
  country: z.string().optional(),
  degreeLevel: z.string().optional(),
  intake: z.string().optional(),
  field: z.string().optional(),
  q: z.string().optional(),

  maxTuition: z.coerce.number().positive().optional(),

  scholarshipAvailable: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  sortBy: z
    .enum(["relevance", "tuitionAsc", "tuitionDesc"])
    .default("relevance"),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});


const listPrograms = asyncHandler(async (req, res) => {
  const result = searchQueriesSchema.safeParse(req.query);
  if (!result.success) {
    throw new HttpError(400, "Invalid query parameters");
  }
  const {
    country,
    degreeLevel,
    intake,
    field,
    q,
    maxTuition,
    scholarshipAvailable,
    sortBy = "relevance",
    page = 1,
    limit = 10,
  } = result.data;

  const filters: any = {};

  if (country) {
    filters.country = country;
  }

  if (degreeLevel) {
    filters.degreeLevel = degreeLevel;
  }

  if (field) {
    filters.field = field;
  }

  if (intake) {
    filters.intakes = intake;
  }

  if (maxTuition) {
    filters.tuitionFeeUsd = { $lte: maxTuition };
  }

  if (scholarshipAvailable !== undefined) {
    filters.scholarshipAvailable = scholarshipAvailable;
  }

  if (q) {
    filters.$or = [
      { title: { $regex: q, $options: "i" } },
      { universityName: { $regex: q, $options: "i" } },
      { field: { $regex: q, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(page, 1);
  const pageSize = Math.min(Math.max(limit, 1), 50);

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    tuitionAsc: { tuitionFeeUsd: 1 },
    tuitionDesc: { tuitionFeeUsd: -1 },
    relevance: { scholarshipAvailable: -1, tuitionFeeUsd: 1 },
  };

  const [items, total] = await Promise.all([
    Program.find(filters)
      .sort(sortMap[sortBy] || sortMap.relevance)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Program.countDocuments(filters),
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export { listPrograms };
