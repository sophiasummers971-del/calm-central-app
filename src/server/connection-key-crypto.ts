import { createServerOnlyFn } from "@tanstack/react-start";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const key = createServerOnlyFn(() => {
  const raw = process.env["APP_USER_CONNECTION_KEY_SECRET"];
  if (!raw) throw new Error("Google connection storage is not configured.");
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length !== 32) throw new Error("Google connection storage is not configured.");
  return decoded;
});
export const encryptConnectionKey = createServerOnlyFn((plaintext: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
});
export const decryptConnectionKey = createServerOnlyFn((stored: string) => {
  const buffer = Buffer.from(stored, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), buffer.subarray(0, 12));
  decipher.setAuthTag(buffer.subarray(12, 28));
  return Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString("utf8");
});