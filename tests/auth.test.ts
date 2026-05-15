import { describe, it, expect } from "vitest";
import { isValidEmail } from "@/lib/auth";

describe("isValidEmail", () => {
  it("accepts valid email format", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts email with subdomain", () => {
    expect(isValidEmail("user@mail.example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects email without TLD", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });
});
