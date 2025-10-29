// /drizzle.config.ts

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  
  // This is the line that was missing or incorrect
  dialect: "mysql", 
  
  dbCredentials: {
    // Make sure process.env.DATABASE_URL is loaded from your .env.local
    url: process.env.DATABASE_URL!, 
  },
  verbose: true,
  strict: true,
});