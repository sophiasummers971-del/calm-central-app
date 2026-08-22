import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { MicButton } from "@/components/MicButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHealthInfo, usePeople, type HealthInfo } from "@/lib/local-store";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency page — doctor, allergies and medicine" },
      {
        name: "description",
        content:
          "One page to show in an emergency: your doctor (GP), allergies, medicine, health conditions and the people who help you.",
      },
      { property: "og:title", content: "Emergency page — doctor, allergies and medicine" },
      {
        property: "og:description",
        content: "Doctor, allergies, medicine and helpers, ready to show in an emergency.",
      },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { value, save, ready } = useHealthInfo();
  const { value: people } = usePeople();
  const [form, setForm] = useState<HealthInfo>(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) setForm(value);
  }, [ready, value]);

  const set = (key: keyof HealthInfo, v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setSaved(false);
  };

  return (
    <PageShell
      title="Emergency"
      intro="Important health information. Show this page to a doctor or helper."
    >
      <section className="rounded-2xl border border-border/60 bg-tile-emergency glow-edge p-5" aria-labelledby="quick">
        <h2 id="quick" className="text-2xl font-bold">
          Quick calls
        </h2>
        <div className="mt-4 space-y-3">
          <a
            href="tel:999"
            className="flex items-center gap-3 rounded-xl bg-destructive px-5 py-4 text-lg font-bold text-destructive-foreground"
          >
            <Phone className="size-6" aria-hidden="true" /> Call 999 — ambulance
          </a>
          {form.gpPhone ? (
            <a
              href={`tel:${form.gpPhone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-3 rounded-xl bg-primary px-5 py-4 text-lg font-bold text-primary-foreground"
            >
              <Phone className="size-6" aria-hidden="true" /> Call my doctor —{" "}
              {form.gpPhone}
            </a>
          ) : null}
          {people.map((person) =>
            person.phone ? (
              <a
                key={person.id}
                href={`tel:${person.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/70 px-5 py-4 text-lg font-bold"
              >
                <Phone className="size-6" aria-hidden="true" /> Call {person.name} ({person.relation})
              </a>
            ) : null,
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 surface p-5" aria-labelledby="nhs">
        <h2 id="nhs" className="text-2xl font-bold">
          NHS help
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          These buttons open the NHS websites in a new tab.
        </p>
        <ul className="mt-4 space-y-3">
          {[
            { href: "tel:111", label: "Call NHS 111 — help when it is not 999", external: false },
            { href: "https://www.nhs.uk/nhs-app/", label: "NHS App — records and prescriptions", external: true },
            { href: "https://111.nhs.uk/", label: "NHS 111 online", external: true },
            { href: "https://www.nhs.uk/service-search/find-a-gp", label: "Find my GP surgery", external: true },
            { href: "https://www.nhs.uk/service-search/pharmacy/find-a-pharmacy", label: "Find a pharmacy", external: true },
          ].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="flex items-center gap-3 rounded-xl bg-secondary px-5 py-4 text-lg font-bold text-secondary-foreground"
              >
                {link.external ? (
                  <ExternalLink className="size-6" aria-hidden="true" />
                ) : (
                  <Phone className="size-6" aria-hidden="true" />
                )}
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <form
        className="mt-6 space-y-4 rounded-2xl border border-border/60 surface p-5"
        onSubmit={(event) => {
          event.preventDefault();
          save(form);
          setSaved(true);
        }}
      >
        <h2 className="text-2xl font-bold">My doctor (GP)</h2>
        <Field id="gpName" label="Doctor's name" value={form.gpName} onChange={(v) => set("gpName", v)} />
        <Field
          id="gpPhone"
          label="Doctor's phone number"
          type="tel"
          value={form.gpPhone}
          onChange={(v) => set("gpPhone", v)}
        />
        <Area
          id="gpAddress"
          label="Doctor's address"
          value={form.gpAddress}
          onChange={(v) => set("gpAddress", v)}
        />
        <Field
          id="nhsNumber"
          label="My NHS or health number"
          value={form.nhsNumber}
          onChange={(v) => set("nhsNumber", v)}
        />

        <h2 className="pt-2 text-2xl font-bold">My health</h2>
        <Area
          id="allergies"
          label="Allergies — things that make me ill"
          value={form.allergies}
          onChange={(v) => set("allergies", v)}
        />
        <Area
          id="medication"
          label="Medicine I take"
          value={form.medication}
          onChange={(v) => set("medication", v)}
        />
        <Area
          id="conditions"
          label="Health conditions"
          value={form.conditions}
          onChange={(v) => set("conditions", v)}
        />
        <Area
          id="supportNeeds"
          label="How to help me (what I need, what upsets me)"
          value={form.supportNeeds}
          onChange={(v) => set("supportNeeds", v)}
        />
        <Field
          id="bloodType"
          label="My blood group (if I know it)"
          value={form.bloodType}
          onChange={(v) => set("bloodType", v)}
        />

        <Button type="submit" className="h-16 w-full text-lg">
          Save emergency information
        </Button>
        {saved ? (
          <p role="status" className="text-center text-lg font-semibold text-primary">
            Saved. Well done.
          </p>
        ) : null}
      </form>
    </PageShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type={type}
          maxLength={120}
          className="h-14 flex-1 text-base"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <MicButton
          label={label}
          onText={(text) => onChange((value ? `${value} ${text}` : text).slice(0, 120))}
        />
      </div>
    </div>
  );
}

function Area({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <div className="flex items-start gap-2">
        <Textarea
          id={id}
          className="min-h-24 flex-1 text-base"
          maxLength={600}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <MicButton
          label={label}
          onText={(text) => onChange((value ? `${value} ${text}` : text).slice(0, 600))}
        />
      </div>
    </div>
  );
}
