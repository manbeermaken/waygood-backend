import Application from "../models/Application.js";
import Program from "../models/Program.js";
import Student from "../models/Student.js";
import redisClient from "../config/redis.js";
import config from "../config/config.js";
import asyncHandler from "../utils/asyncHandler.js";

const getOverview = asyncHandler(async (req, res) => {
  const cacheKey = "waygood:dashboard-overview";
  const cachedPayload = await redisClient.get(cacheKey);

  if (cachedPayload) {
    return res.json({
      success: true,
      data: cachedPayload,
      meta: { cache: "hit" },
    });
  }

  const [
    totalStudents,
    totalPrograms,
    totalApplications,
    statusBreakdown,
    topCountries,
  ] = await Promise.all([
    Student.countDocuments(),
    Program.countDocuments(),
    Application.countDocuments(),
    Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Application.aggregate([
      { $group: { _id: "$destinationCountry", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const payload = {
    totalStudents,
    totalPrograms,
    totalApplications,
    statusBreakdown,
    topCountries,
  };

  await redisClient.setEx(cacheKey, config.CACHE_TTL_SECONDS, JSON.stringify(payload));

  res.json({
    success: true,
    data: payload,
    meta: { cache: "miss" },
  });
});

export { getOverview };
