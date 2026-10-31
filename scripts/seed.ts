import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { connectToDatabase } from "../src/lib/db";
import { User } from "../src/models/User";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";

async function seed() {
  console.log("🌱 Starting Mini Project Manager database seed...");

  await connectToDatabase();

  const demoEmail = "demo@example.com";
  const demoPassword = "Password123";

  // 1. Clean up existing demo user and their projects/tasks for clean idempotency
  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    console.log(`Found existing demo user (${demoEmail}). Purging previous data...`);
    const existingProjects = await Project.find({ owner: existingUser._id });
    const projectIds = existingProjects.map((p) => p._id);

    await Task.deleteMany({ project: { $in: projectIds } });
    await Project.deleteMany({ owner: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
    console.log("Previous demo data purged.");
  }

  // 2. Create demo user
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const demoUser = await User.create({
    name: "Demo Reviewer",
    email: demoEmail,
    passwordHash,
  });

  console.log(`✓ Demo user created: ${demoUser.email} (ID: ${demoUser._id})`);

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Helper date offset generator
  const daysFromNow = (days: number) => new Date(now.getTime() + days * dayMs);

  // 3. Define seed projects and tasks
  const seedData = [
    {
      title: "Brand Identity Refresh",
      description:
        "Revamp corporate branding guidelines, design system tokens, typography scales, and marketing collateral.",
      tasks: [
        {
          title: "Audit existing brand assets and typography scales",
          description:
            "Catalog existing color variables and typography hierarchy across marketing and web app.",
          status: "done" as const,
          dueDate: daysFromNow(-4),
        },
        {
          title: "Finalize solid color tokens and contrast matrix",
          description:
            "Define vermilion accent palette (#E5502B / #FF6A42) and test against WCAG AA requirements.",
          status: "done" as const,
          dueDate: daysFromNow(-2),
        },
        {
          title: "Design new monogram and vector icon system",
          description:
            "Generate SVG monogram and export favicon and app icons in light and dark variants.",
          status: "in-progress" as const,
          dueDate: daysFromNow(-1), // Overdue task
        },
        {
          title: "Review component library in light and dark modes",
          description:
            "Verify Dialog, ResponsiveModal, Button variants, and Segmented controls across all breakpoints.",
          status: "in-progress" as const,
          dueDate: daysFromNow(2),
        },
        {
          title: "Draft executive presentation deck",
          description:
            "Create slides presenting rationale for the calm, editorial aesthetic.",
          status: "todo" as const,
          dueDate: daysFromNow(4),
        },
        {
          title: "Organize marketing department feedback session",
          description:
            "Coordinate review with design leads and collect feedback on release timeline.",
          status: "todo" as const,
          dueDate: null, // No due date (verifies sort-last behavior)
        },
      ],
    },
    {
      title: "Mobile App v2.0",
      description:
        "Native cross-platform mobile client with offline synchronization, biometric auth, and haptic feedback.",
      tasks: [
        {
          title: "Implement biometric FaceID / TouchID login flow",
          description:
            "Secure keychain storage with fallback password authorization prompt.",
          status: "done" as const,
          dueDate: daysFromNow(-8),
        },
        {
          title: "Resolve iOS Safari viewport rubber-band bounce",
          description:
            "Ensure fixed modals and bottom sheets respect viewport safe area boundaries.",
          status: "done" as const,
          dueDate: daysFromNow(-5),
        },
        {
          title: "Add offline SQLite caching layer",
          description:
            "Queue mutations locally and synchronize when network connectivity is restored.",
          status: "in-progress" as const,
          dueDate: daysFromNow(3),
        },
        {
          title: "Test push notification delivery on Android 15",
          description:
            "Verify foreground, background, and notification banner handling on target devices.",
          status: "todo" as const,
          dueDate: daysFromNow(7),
        },
        {
          title: "Prepare App Store and Google Play metadata",
          description:
            "Draft release notes, screenshots for 6.7 inch and 6.1 inch displays, and compliance disclosure.",
          status: "todo" as const,
          dueDate: null, // No due date
        },
      ],
    },
    {
      title: "Q4 Infrastructure Migration",
      description:
        "Migrate containerized microservices to Kubernetes cluster with automated zero-downtime canary deployments.",
      tasks: [
        {
          title: "Provision managed Atlas MongoDB replica set",
          description:
            "Configure IP access lists, TLS 1.3 certificates, and automated snapshot backup policies.",
          status: "done" as const,
          dueDate: daysFromNow(-12),
        },
        {
          title: "Configure Terraform infrastructure as code",
          description:
            "Version-control VPC peering, subnets, and IAM roles for cluster nodes.",
          status: "done" as const,
          dueDate: daysFromNow(-6),
        },
        {
          title: "Setup Prometheus and Grafana alerting thresholds",
          description:
            "Alert on 5xx error rate spikes > 1% and p99 latency exceeding 250ms.",
          status: "in-progress" as const,
          dueDate: daysFromNow(-2), // Overdue task
        },
        {
          title: "Execute load testing at 10,000 sustained RPS",
          description:
            "Benchmark authentication rate limiter and database connection pool under stress.",
          status: "todo" as const,
          dueDate: daysFromNow(6),
        },
      ],
    },
  ];

  let totalTasksCreated = 0;

  for (const projectData of seedData) {
    const project = await Project.create({
      owner: demoUser._id,
      title: projectData.title,
      description: projectData.description,
    });

    console.log(`✓ Project created: "${project.title}" (ID: ${project._id})`);

    const taskDocs = projectData.tasks.map((t) => ({
      owner: demoUser._id,
      project: project._id,
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate,
    }));

    await Task.insertMany(taskDocs);
    totalTasksCreated += taskDocs.length;
    console.log(`  └─ Created ${taskDocs.length} tasks.`);
  }

  console.log("\n=======================================================");
  console.log("🎉 Database seeding complete!");
  console.log("=======================================================");
  console.log("Reviewer Login Credentials:");
  console.log(`  Email:    ${demoEmail}`);
  console.log(`  Password: ${demoPassword}`);
  console.log("-------------------------------------------------------");
  console.log(`Created: 1 user, ${seedData.length} projects, ${totalTasksCreated} tasks.`);
  console.log("=======================================================\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
