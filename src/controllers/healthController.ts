import type { RequestHandler } from "express";

export const getHealth: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: {
      service: "waygood-evaluation-api",
      timestamp: new Date().toISOString(),
      status: "ok",
    },
  });
};
