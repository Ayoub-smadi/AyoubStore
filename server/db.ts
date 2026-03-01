import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// For development without a provisioned database, we'll use a local fallback
// but the actual connection requires DATABASE_URL to be set via integration
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/bustracking" 
});

export const db = drizzle(pool, { schema });
