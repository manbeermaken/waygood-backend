import Program from "../models/Program.js";
import Student from "../models/Student.js";
import HttpError from "../utils/httpError.js";

// Helper to escape regex characters in interested fields safely
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function buildProgramRecommendations(studentId: string) {
  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const targetCountries = student.targetCountries || [];

  const fieldRegex = student.interestedFields?.length
    ? student.interestedFields.map(escapeRegex).join("|")
    : "(?!)";

  const maxBudget = student.maxBudgetUsd || null;
  const preferredIntake = student.preferredIntake || null;
  const englishScore = student.englishTest?.score || 0;

  const recommendations = await Program.aggregate([
    {
      $match: {
        country: { $in: targetCountries },
      },
    },
    {
      $addFields: {
        score_country: {
          $cond: [{ $in: ["$country", targetCountries] }, 35, 0],
        },
        score_field: {
          $cond: [
            {
              $regexMatch: { input: "$field", regex: fieldRegex, options: "i" },
            },
            30,
            0,
          ],
        },
        score_budget: {
          $cond: [
            {
              $and: [
                { $ne: [maxBudget, null] },
                { $gte: [maxBudget, "$tuitionFeeUsd"] },
              ],
            },
            20,
            0,
          ],
        },
        score_intake: {
          $cond: [
            {
              $and: [
                { $ne: [preferredIntake, null] },
                { $in: [preferredIntake, "$intakes"] },
              ],
            },
            10,
            0,
          ],
        },
        score_english: {
          $cond: [{ $gte: [englishScore, "$minimumIelts"] }, 5, 0],
        },
      },
    },
    {
      $addFields: {
        matchScore: {
          $add: [
            "$score_country",
            "$score_field",
            "$score_budget",
            "$score_intake",
            "$score_english",
          ],
        },
        reasons: {
          $filter: {
            input: [
              {
                $cond: [
                  { $gt: ["$score_country", 0] },
                  { $concat: ["Preferred country match: ", "$country"] },
                  null,
                ],
              },
              {
                $cond: [
                  { $gt: ["$score_field", 0] },
                  { $concat: ["Field alignment: ", "$field"] },
                  null,
                ],
              },
              {
                $cond: [
                  { $gt: ["$score_budget", 0] },
                  "Within budget range",
                  null,
                ],
              },
              {
                $cond: [
                  { $gt: ["$score_intake", 0] },
                  {
                    $concat: [
                      "Preferred intake available: ",
                      preferredIntake || "",
                    ],
                  },
                  null,
                ],
              },
              {
                $cond: [
                  { $gt: ["$score_english", 0] },
                  "English test score meets requirement",
                  null,
                ],
              },
            ],
            as: "reason",
            cond: { $ne: ["$$reason", null] },
          },
        },
      },
    },
    {
      $sort: { matchScore: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        score_country: 0,
        score_field: 0,
        score_budget: 0,
        score_intake: 0,
        score_english: 0,
      },
    },
  ]);

  return {
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        targetCountries: student.targetCountries,
        interestedFields: student.interestedFields,
      },
      recommendations,
    },
    meta: {
      implementationStatus: "mongodb-aggregation-implemented",
    },
  };
}

export { buildProgramRecommendations };
