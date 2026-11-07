import { describe, expect, test } from "bun:test";
import { newPasswordSchema, recoveryEmailSchema } from "../src/lib/password-recovery";

describe("password recovery", () => {
  test("validates and trims the recovery email", () => {
    expect(recoveryEmailSchema.parse(" person@example.com ")).toBe("person@example.com");
    expect(recoveryEmailSchema.safeParse("not-an-email").success).toBe(false);
  });
  test("rejects mismatching password confirmation", () => {
    expect(
      newPasswordSchema.safeParse({ password: "secure-example", confirmation: "different-example" })
        .success,
    ).toBe(false);
    expect(
      newPasswordSchema.safeParse({ password: "secure-example", confirmation: "secure-example" })
        .success,
    ).toBe(true);
  });
  test("rejects passwords below the existing six-character minimum", () => {
    expect(newPasswordSchema.safeParse({ password: "12345", confirmation: "12345" }).success).toBe(
      false,
    );
    expect(
      newPasswordSchema.safeParse({ password: "123456", confirmation: "123456" }).success,
    ).toBe(true);
  });
});
