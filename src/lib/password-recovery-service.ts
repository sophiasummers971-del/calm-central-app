import { supabase } from "@/integrations/supabase/client";
import { recoveryEmailSchema, newPasswordSchema } from "@/lib/password-recovery";

export async function requestPasswordReset(email: string) {
  const validEmail = recoveryEmailSchema.parse(email);
  const { error } = await supabase.auth.resetPasswordForEmail(validEmail, {
    redirectTo: new URL("/reset-password", window.location.origin).href,
  });
  if (error)
    throw new Error("We could not send the reset email. Please wait a few minutes and try again.");
}

export async function updateRecoveredPassword(password: string, confirmation: string) {
  const values = newPasswordSchema.parse({ password, confirmation });
  const { data, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !data.user)
    throw new Error("This link has expired. Please request a new reset email.");
  const { error } = await supabase.auth.updateUser({ password: values.password });
  if (error)
    throw new Error(
      "The password could not be changed. Try a stronger password or request a new link.",
    );
}
