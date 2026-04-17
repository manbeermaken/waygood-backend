import asyncHandler from "../utils/asyncHandler.js";

const getHealth = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      service: "waygood-evaluation-api",
      timestamp: new Date().toISOString(),
      status: "ok",
    },
  });
});

export { getHealth }
