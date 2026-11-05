import { describe, expect, test } from "bun:test";
import { oauthReturnPath } from "../src/lib/oauth-return-path";

describe("OAuth login return path", () => {
  test("preserves the complete local consent destination", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#review")).toBe("/.lovable/oauth/consent?authorization_id=abc#review");
  });
  test("rejects external and malformed destinations", () => {
    for (const value of ["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/path\n", null]) expect(oauthReturnPath(value)).toBe("/");
  });
});