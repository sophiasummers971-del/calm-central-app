import type { ReactNode } from "react";

export type InfoItem = { title: string; points: string[] };

/** Big, simple cards with short bullet points. */
export function InfoCards({ items }: { items: InfoItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.title} className="rounded-2xl border border-border/60 surface p-4 sm:p-5">
          <h2 className="font-display text-xl font-bold tracking-wide sm:text-2xl">{item.title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-base sm:text-lg">
            {item.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function NotMedicalAdvice({ children }: { children?: ReactNode }) {
  return (
    <p className="mt-6 rounded-xl border border-border/60 bg-secondary p-4 text-base text-secondary-foreground">
      {children ??
        "This is general information, not medical advice. If you are worried, call NHS 111. In an emergency, call 999."}
    </p>
  );
}
