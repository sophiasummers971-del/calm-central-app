import { z } from "zod";

export const recoveryEmailSchema = z.string().trim().email("Enter a valid email address.");

export const newPasswordSchema = z.object({
  password: z.string().min(6, "Use at least 6 characters."),
  confirmation: z.string(),
}).refine((value) => value.password === value.confirmation, {
  message: "The passwords do not match.",
  path: ["confirmation"],
});