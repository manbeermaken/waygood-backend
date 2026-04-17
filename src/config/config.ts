import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000), 
  MONGODB_URI: z.url().default("mongodb://127.0.0.1:27017/waygood-evaluation"),
  JWT_SECRET: z.string().min(1).default("jwt_secret"),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  OPENAI_API_KEY: z.string().optional(),
});

const envValidation = envSchema.safeParse(process.env);

if(!envValidation.success){
  console.log("Invalid or missing enviroment Variables")
  console.log(z.prettifyError(envValidation.error))
  process.exit(1)
}

const config = envValidation.data

export default config