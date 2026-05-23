import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("4000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ZALO_OA_APP_ID: z.string().optional(),
  ZALO_OA_SECRET: z.string().optional(),
  ZALO_OA_ACCESS_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  QDRANT_URL: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  API_URL: z.string().url().default("http://localhost:4000"),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  console.error(`Env validation failed: ${issues}`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
