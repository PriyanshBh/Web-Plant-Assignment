import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { connectToDatabase } from "../src/lib/db";
import { User } from "../src/models/User";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env.local or environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const conn = await connectToDatabase();
  console.log("✅ Successfully connected to MongoDB:", conn.connection.name);

  // Validate models registration
  console.log("Checking models registration:");
  console.log("- User model:", !!User);
  console.log("- Project model:", !!Project);
  console.log("- Task model:", !!Task);

  console.log("✅ Database and Models test passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Database connection error:", err.message);
  process.exit(1);
});
