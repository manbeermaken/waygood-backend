import University from "../models/University.js";
import redisClient from "../config/redis.js";
import * as z from "zod";
import HttpError from "../utils/httpError.js";
import config from "../config/config.js";
import type { RequestHandler } from "express";

const searchQueriesSchema = z.object({
  country: z.string().optional(),
  partnerType: z
    .enum(["direct", "recruitment-partner", "institution-partner"])
    .default("direct"),
  q: z.string().optional(),

  maxTuition: z.coerce.number().positive().optional(),

  scholarshipAvailable: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  sortBy: z.enum(["popular", "ranking", "name"]).default("popular"),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const listUniversities: RequestHandler = async (req, res) => {
  const result = searchQueriesSchema.safeParse(req.query);
  if (!result.success) {
    throw new HttpError(400, "Invalid query parameters");
  }
  const {
    country,
    partnerType,
    q,
    scholarshipAvailable,
    sortBy = "popular",
    page = 1,
    limit = 10,
  } = result.data;

  const filters: any = {};

  if (country) {
    filters.country = country;
  }

  if (partnerType) {
    filters.partnerType = partnerType;
  }

  if (scholarshipAvailable !== undefined) {
    filters.scholarshipAvailable = scholarshipAvailable;
  }

  if (q) {
    filters.$or = [
      { name: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(page, 1);
  const pageSize = Math.min(Math.max(limit, 1), 50);

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    name: { name: 1 },
    ranking: { qsRanking: 1, popularScore: -1 },
    popular: { popularScore: -1, qsRanking: 1 },
  };

  const [items, total] = await Promise.all([
    University.find(filters)
      .sort(sortMap[sortBy] || sortMap.popular)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    University.countDocuments(filters),
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
};

export const listPopularUniversities: RequestHandler = async (req, res) => {
  const cacheKey = "waygood:popular-universities";
  const cachedPayload = await redisClient.get(cacheKey);

  if (cachedPayload) {
    return res.json({
      success: true,
      data: JSON.parse(cachedPayload),
      meta: {
        cache: "hit",
      },
    });
  }

  const universities = await University.find()
    .sort({ popularScore: -1, qsRanking: 1 })
    .limit(6)
    .lean();

  await redisClient.setEx(
    cacheKey,
    config.CACHE_TTL_SECONDS,
    JSON.stringify(universities),
  );

  res.json({
    success: true,
    data: universities,
    meta: {
      cache: "miss",
    },
  });
};
