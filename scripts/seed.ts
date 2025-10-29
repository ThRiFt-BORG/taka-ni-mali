/**
 * Seed script - populate database with demo users and sample data
 * Run with: pnpm ts-node scripts/seed.ts
 */

import 'dotenv/config'; // <-- THIS IS THE FIX
import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { users, collections } from "../drizzle/schema";
import { hashPassword } from "../server/_core/auth";

async function seed() {
  console.log("🌱 Starting database seed...");

  const db = await getDb();
  if (!db) {
    // This check should no longer fail
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    // Create demo users
    console.log("📝 Creating demo users...");

    // This is a good practice for seeding: delete old demo data first
    // to make the script re-runnable.
    console.log("🗑️ Deleting existing demo data...");
    await db.delete(users).where(eq(users.loginMethod, "local"));


    const adminPassword = await hashPassword("password123");
    const collectorPassword = await hashPassword("password123");
    const userPassword = await hashPassword("password123");

    // Admin user
    await db.insert(users).values({
      openId: "demo_admin_local",
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      loginMethod: "local",
    });

    // Collector users
    await db.insert(users).values({
      openId: "demo_collector1_local",
      email: "collector1@example.com",
      name: "John Collector",
      password: collectorPassword,
      role: "collector",
      loginMethod: "local",
    });

    await db.insert(users).values({
      openId: "demo_collector2_local",
      email: "collector2@example.com",
      name: "Jane Collector",
      password: collectorPassword,
      role: "collector",
      loginMethod: "local",
    });

    // Public user
    await db.insert(users).values({
      openId: "demo_user_local",
      email: "user@example.com",
      name: "Public User",
      password: userPassword,
      role: "user",
      loginMethod: "local",
    });

    console.log("✅ Demo users created successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("  Admin: admin@example.com / password123");
    console.log("  Collector 1: collector1@example.com / password123");
    console.log("  Collector 2: collector2@example.com / password123");
    console.log("  Public User: user@example.com / password123");

    // Create sample collection data
    console.log("\n Creating sample collection data...");

    const collectorResult = await db
      .select()
      .from(users)
      .where(eq(users.email, "collector1@example.com"));

    if (collectorResult.length > 0) {
      const collectorId = collectorResult[0].id;

      // Sample collections
      const sampleCollections = [
        {
          collectorId,
          siteName: "Kakamega Main Dumpsite",
          wasteType: "Organic" as const,
          collectionDate: new Date("2025-10-20"),
          totalVolume: "12.5",
          wasteSeparated: true,
          organicVolume: "8.5",
          inorganicVolume: "4.0",
          collectionCount: 3,
          latitude: "-0.3031",
          longitude: "34.7616",
        },
        {
          collectorId,
          siteName: "Khayega Dumpsite",
          wasteType: "Mixed" as const,
          collectionDate: new Date("2025-10-21"),
          totalVolume: "18.3",
          wasteSeparated: false,
          collectionCount: 2,
          latitude: "-0.2950",
          longitude: "34.7700",
        },
        {
          collectorId,
          siteName: "Lurambi Collection Point",
          wasteType: "Inorganic" as const,
          collectionDate: new Date("2025-10-22"),
          totalVolume: "15.7",
          wasteSeparated: true,
          organicVolume: "3.2",
          inorganicVolume: "12.5",
          collectionCount: 1,
          latitude: "-0.3100",
          longitude: "34.7500",
        },
      ];

      for (const collection of sampleCollections) {
        await db.insert(collections).values(collection as any);
      }

      console.log(`✅ Created ${sampleCollections.length} sample collections!`);
    }

    console.log("\n✨ Database seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(" Seed error:", error);
    process.exit(1);
  }
}

seed();