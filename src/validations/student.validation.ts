import * as z from 'zod'

export const StudentValidationSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  email: z.email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "counselor"]).optional().default("student"),
  targetCountries: z.array(z.string()).optional(),
  interestedFields: z.array(z.string()).optional(),
  preferredIntake: z.string().optional(),
  maxBudgetUsd: z.number().optional(),
  englishTest: z
    .object({
      exam: z.string().default("IELTS"),
      score: z.number().default(0),
    })
    .optional(),
  profileComplete: z.boolean().optional().default(false),
});

export type StudentBaseType = z.infer<typeof StudentValidationSchema>