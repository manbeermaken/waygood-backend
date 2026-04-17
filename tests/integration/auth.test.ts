import app from "../../src/app";
import { describe, it, expect } from "vitest";
import request from "supertest";

describe("Auth api integration", () => {
  it("should successfully login student", async () => {
    const student = {
      email: "sara@example.com",
      password: "Candidate123!",
    };
    const response = await request(app).post("/api/auth/login").send(student);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("token");
  });
});
