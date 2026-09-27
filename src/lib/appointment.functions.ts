import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SummaryInput = z.object({
  concern: z.string().min(1),
});

const SummarySchema = z.object({
  mainProblem: z.string(),
  howLong: z.string(),
  symptoms: z.array(z.string()),
  thingsThatHelpOrMakeItWorse: z.array(z.string()),
  medicinesMentioned: z.array(z.string()),
  questionsForTheDoctor: z.array(z.string()),
  urgentWarning: z.string().nullable(),
});

export type AppointmentSummary = z.infer<typeof SummarySchema>;

const SYSTEM = [
  "You help a person with learning difficulties get ready for a doctor's appointment.",
  "Take their free-text description of how they feel and organise it.",
  "Use very simple, short, plain English. Short sentences. No medical jargon.",
  "Never diagnose and never give treatment advice.",
  "Keep each list item under about 15 words, and at most 6 items per list.",
  "If the words describe something that could be an emergency (chest pain, trouble breathing,",
  "heavy bleeding, sudden weakness, thoughts of self-harm), put a short plain warning in",
  "urgentWarning telling them to call 999 or NHS 111. Otherwise set urgentWarning to null.",
].join(" ");

export const summarizeConcern = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SummaryInput.parse(input))
  .handler(async ({ data }): Promise<AppointmentSummary> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not set up yet.");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        system: SYSTEM,
        prompt: data.concern.slice(0, 4000),
        output: Output.object({ schema: SummarySchema }),
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });

      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("Sorry, the summary did not work. Please try again.");
      }
      throw error;
    }
  });
