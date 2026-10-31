import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextRequest } from "next/server";
import { POST as signupHandler } from "../src/app/api/auth/signup/route";
import { GET as getProjectsHandler, POST as createProjectHandler } from "../src/app/api/projects/route";
import {
  GET as getProjectHandler,
  PATCH as patchProjectHandler,
  DELETE as deleteProjectHandler,
} from "../src/app/api/projects/[id]/route";
import {
  GET as getTasksHandler,
  POST as createTaskHandler,
} from "../src/app/api/projects/[id]/tasks/route";
import {
  PATCH as patchTaskHandler,
  DELETE as deleteTaskHandler,
} from "../src/app/api/projects/[id]/tasks/[taskId]/route";
import { User } from "../src/models/User";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";
import { connectToDatabase } from "../src/lib/db";

async function main() {
  await connectToDatabase();

  const timestamp = Date.now();
  const userAEmail = `user_a_${timestamp}@example.com`;
  const userBEmail = `user_b_${timestamp}@example.com`;
  const password = "Password123";

  console.log("=== 1. Create User A and User B ===");
  const resA = await signupHandler(
    new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User A", email: userAEmail, password }),
    })
  );
  const dataA = await resA.json();
  const tokenA = dataA.data.token;

  const resB = await signupHandler(
    new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User B", email: userBEmail, password }),
    })
  );
  const dataB = await resB.json();
  const tokenB = dataB.data.token;

  console.log("=== 2. User A creates Project Alpha ===");
  const createProjRes = await createProjectHandler(
    new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "Project Alpha",
        description: "Initial description for Alpha",
      }),
    }),
    { params: Promise.resolve({}) }
  );
  const projA = (await createProjRes.json()).data;
  console.log("Created Project Alpha ID:", projA.id);

  console.log("=== 3. User A creates 3 tasks in Project Alpha ===");
  // Task 1: todo, dueDate tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const t1Res = await createTaskHandler(
    new NextRequest(`http://localhost:3000/api/projects/${projA.id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "Design System Architecture",
        description: "Tokens, colors, and layout",
        status: "todo",
        dueDate: tomorrow,
      }),
    }),
    { params: Promise.resolve({ id: projA.id }) }
  );
  const t1 = (await t1Res.json()).data;

  // Task 2: in-progress, dueDate in 3 days
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString();
  const t2Res = await createTaskHandler(
    new NextRequest(`http://localhost:3000/api/projects/${projA.id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "API Endpoint Implementation",
        description: "Build endpoints",
        status: "in-progress",
        dueDate: in3Days,
      }),
    }),
    { params: Promise.resolve({ id: projA.id }) }
  );
  const t2 = (await t2Res.json()).data;

  // Task 3: done, NO dueDate
  const t3Res = await createTaskHandler(
    new NextRequest(`http://localhost:3000/api/projects/${projA.id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "Database schema design",
        description: "Initial models",
        status: "done",
      }),
    }),
    { params: Promise.resolve({ id: projA.id }) }
  );
  const t3 = (await t3Res.json()).data;

  console.log("=== 4. Check Project List and Task Counts ===");
  const listRes = await getProjectsHandler(
    new NextRequest("http://localhost:3000/api/projects", {
      headers: { Authorization: `Bearer ${tokenA}` },
    }),
    { params: Promise.resolve({}) }
  );
  const projectList = (await listRes.json()).data;
  console.log("Project taskCounts:", projectList[0].taskCounts);
  if (
    projectList[0].taskCounts.total !== 3 ||
    projectList[0].taskCounts.todo !== 1 ||
    projectList[0].taskCounts.inProgress !== 1 ||
    projectList[0].taskCounts.done !== 1
  ) {
    throw new Error("Task counts mismatch");
  }

  console.log("=== 5. Test Task Sorting (tasks with no dueDate sort last) ===");
  const sortedTasksRes = await getTasksHandler(
    new NextRequest(
      `http://localhost:3000/api/projects/${projA.id}/tasks?sort=dueDate&order=asc`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    ),
    { params: Promise.resolve({ id: projA.id }) }
  );
  const sortedTasks = (await sortedTasksRes.json()).data;
  console.log(
    "Sorted task titles and due dates:",
    sortedTasks.map((t: any) => ({ title: t.title, dueDate: t.dueDate }))
  );
  // Last task should have dueDate == null
  if (sortedTasks[sortedTasks.length - 1].dueDate !== null) {
    throw new Error("Task with no due date was not sorted last");
  }

  console.log("=== 6. Test Task Filter and Search ===");
  const filterRes = await getTasksHandler(
    new NextRequest(
      `http://localhost:3000/api/projects/${projA.id}/tasks?status=in-progress`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    ),
    { params: Promise.resolve({ id: projA.id }) }
  );
  const filtered = (await filterRes.json()).data;
  if (filtered.length !== 1 || filtered[0].id !== t2.id) {
    throw new Error("Status filter failed");
  }

  const searchRes = await getTasksHandler(
    new NextRequest(
      `http://localhost:3000/api/projects/${projA.id}/tasks?q=Design`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    ),
    { params: Promise.resolve({ id: projA.id }) }
  );
  const searchResults = (await searchRes.json()).data;
  console.log("Search 'Design' matched:", searchResults.length, "tasks");
  if (searchResults.length !== 2) {
    throw new Error("Search filter failed");
  }

  console.log("=== 7. Test Cross-User Isolation (User B cannot access User A's data) ===");
  // User B tries to GET Project A -> 404
  const crossGetRes = await getProjectHandler(
    new NextRequest(`http://localhost:3000/api/projects/${projA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    }),
    { params: Promise.resolve({ id: projA.id }) }
  );
  console.log("Cross User GET project status:", crossGetRes.status);
  if (crossGetRes.status !== 404) {
    throw new Error("Cross-user project GET should return 404");
  }

  // User B tries to PATCH Task 1 -> 404
  const crossPatchTaskRes = await patchTaskHandler(
    new NextRequest(
      `http://localhost:3000/api/projects/${projA.id}/tasks/${t1.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({ title: "Hacked by User B" }),
      }
    ),
    { params: Promise.resolve({ id: projA.id, taskId: t1.id }) }
  );
  console.log("Cross User PATCH task status:", crossPatchTaskRes.status);
  if (crossPatchTaskRes.status !== 404) {
    throw new Error("Cross-user task PATCH should return 404");
  }

  console.log("=== 8. Test Cascade Delete ===");
  const delProjRes = await deleteProjectHandler(
    new NextRequest(`http://localhost:3000/api/projects/${projA.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    }),
    { params: Promise.resolve({ id: projA.id }) }
  );
  console.log("Delete Project status:", delProjRes.status);
  if (delProjRes.status !== 200) {
    throw new Error("Delete project failed");
  }

  // Verify tasks are deleted
  const remainingTasks = await Task.find({ project: projA.id });
  console.log("Remaining tasks in deleted project:", remainingTasks.length);
  if (remainingTasks.length !== 0) {
    throw new Error("Cascade delete failed to delete tasks");
  }

  // Cleanup test users
  await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });
  console.log("\n✅ All Projects and Tasks API tests passed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Projects/Tasks test failed:", err);
  process.exit(1);
});
