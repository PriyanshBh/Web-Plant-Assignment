import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextRequest } from "next/server";
import { POST as signupHandler } from "../src/app/api/auth/signup/route";
import { POST as loginHandler } from "../src/app/api/auth/login/route";
import { GET as meHandler } from "../src/app/api/auth/me/route";
import { POST as logoutHandler } from "../src/app/api/auth/logout/route";
import { User } from "../src/models/User";
import { connectToDatabase } from "../src/lib/db";

async function main() {
  await connectToDatabase();

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "Password123";

  console.log("1. Testing POST /api/auth/signup...");
  const signupReq = new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: testEmail,
      password: testPassword,
    }),
  });

  const signupRes = await signupHandler(signupReq);
  const signupJson = await signupRes.json();
  console.log("Signup Status:", signupRes.status);
  console.log("Signup Response:", signupJson);

  if (signupRes.status !== 201 || !signupJson.data?.token) {
    throw new Error("Signup failed");
  }

  const token = signupJson.data.token;

  console.log("\n2. Testing duplicate signup (409 Conflict)...");
  const dupReq = new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User 2",
      email: testEmail,
      password: testPassword,
    }),
  });
  const dupRes = await signupHandler(dupReq);
  const dupJson = await dupRes.json();
  console.log("Duplicate Signup Status:", dupRes.status);
  console.log("Duplicate Signup Response:", dupJson);
  if (dupRes.status !== 409) {
    throw new Error("Duplicate signup did not return 409");
  }

  console.log("\n3. Testing POST /api/auth/login with valid credentials...");
  const loginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginRes = await loginHandler(loginReq);
  const loginJson = await loginRes.json();
  console.log("Login Status:", loginRes.status);
  if (loginRes.status !== 200 || !loginJson.data?.token) {
    throw new Error("Login failed");
  }

  console.log("\n4. Testing POST /api/auth/login with invalid password (401)...");
  const badLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "WrongPassword123",
    }),
  });
  const badLoginRes = await loginHandler(badLoginReq);
  console.log("Bad Login Status:", badLoginRes.status);
  if (badLoginRes.status !== 401) {
    throw new Error("Bad login did not return 401");
  }

  console.log("\n5. Testing GET /api/auth/me using Bearer token...");
  const meReq = new NextRequest("http://localhost:3000/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const meRes = await meHandler(meReq, { params: Promise.resolve({}) });
  const meJson = await meRes.json();
  console.log("Me Status:", meRes.status);
  console.log("Me Response User:", meJson.data?.user?.email);
  if (meRes.status !== 200 || meJson.data?.user?.email !== testEmail) {
    throw new Error("Me endpoint failed");
  }

  console.log("\n6. Testing POST /api/auth/logout...");
  const logoutReq = new NextRequest("http://localhost:3000/api/auth/logout", {
    method: "POST",
  });
  const logoutRes = await logoutHandler();
  const logoutJson = await logoutRes.json();
  console.log("Logout Status:", logoutRes.status);
  console.log("Logout Response:", logoutJson);

  // Clean up test user
  await User.deleteOne({ email: testEmail });
  console.log("\n✅ All Auth API routes tested successfully and test user cleaned up.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Auth test failed:", err);
  process.exit(1);
});
