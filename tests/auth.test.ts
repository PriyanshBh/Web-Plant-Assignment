import { describe, it, expect, beforeAll } from "vitest";
import { signToken, verifyToken } from "../src/lib/jwt";
import {
  signupSchema,
  loginSchema,
  objectIdSchema,
  passwordSchema,
  taskStatusSchema,
} from "../src/lib/validators";
import bcrypt from "bcryptjs";

describe("JWT Utilities", () => {
  beforeAll(() => {
    process.env.JWT_SECRET =
      "super-secret-jwt-key-with-at-least-32-characters-minimum-length-requirement";
  });

  it("should sign and verify a token successfully", async () => {
    const userId = "64f1a2b3c4d5e6f7a8b9c0d1";
    const token = await signToken(userId, "1h");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe(userId);
  });

  it("should return null for tampered token", async () => {
    const userId = "64f1a2b3c4d5e6f7a8b9c0d1";
    const token = await signToken(userId, "1h");
    const tampered = token.slice(0, -5) + "abcde";

    const payload = await verifyToken(tampered);
    expect(payload).toBeNull();
  });
});

describe("Password and Validators", () => {
  it("should validate strong passwords (min 8 chars, 1 letter, 1 number)", () => {
    expect(() => passwordSchema.parse("ValidPass1")).not.toThrow();
    expect(() => passwordSchema.parse("short1")).toThrow();
    expect(() => passwordSchema.parse("alllettersnodeligit")).toThrow();
    expect(() => passwordSchema.parse("12345678")).toThrow();
  });

  it("should validate user signup schema", () => {
    const valid = {
      name: "Alice Tester",
      email: "Alice@Example.Com",
      password: "Password123",
    };
    const parsed = signupSchema.parse(valid);
    expect(parsed.name).toBe("Alice Tester");
    expect(parsed.email).toBe("alice@example.com");

    expect(() =>
      signupSchema.parse({
        name: "A",
        email: "invalid-email",
        password: "weak",
      })
    ).toThrow();
  });

  it("should validate user login schema", () => {
    const valid = { email: "USER@domain.com", password: "somePassword1" };
    const parsed = loginSchema.parse(valid);
    expect(parsed.email).toBe("user@domain.com");

    expect(() => loginSchema.parse({ email: "not-an-email", password: "" })).toThrow();
  });

  it("should validate 24-character hex ObjectId", () => {
    expect(() => objectIdSchema.parse("64f1a2b3c4d5e6f7a8b9c0d1")).not.toThrow();
    expect(() => objectIdSchema.parse("invalid-id")).toThrow();
    expect(() => objectIdSchema.parse("123")).toThrow();
  });

  it("should validate task status enum", () => {
    expect(() => taskStatusSchema.parse("todo")).not.toThrow();
    expect(() => taskStatusSchema.parse("in-progress")).not.toThrow();
    expect(() => taskStatusSchema.parse("done")).not.toThrow();
    expect(() => taskStatusSchema.parse("archived")).toThrow();
  });

  it("should hash and verify passwords using bcryptjs with cost 12", async () => {
    const password = "SecurePassword123";
    const hash = await bcrypt.hash(password, 12);
    expect(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$")).toBe(true);

    const matches = await bcrypt.compare(password, hash);
    expect(matches).toBe(true);

    const wrongMatches = await bcrypt.compare("WrongPassword", hash);
    expect(wrongMatches).toBe(false);
  });
});
