import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { newId, usePeople, useMyDetails, type MyDetails } from "@/lib/local-store";

export const Route = createFileRoute("/my-details")({
  head: () => ({
    meta: [
      { title: "My details — name, home address and phone" },
      {
        name: "description",
        content:
          "Keep your name, date of birth, home address, phone number and the people you call in one easy page.",
      },
      { property: "og:title", content: "My details — name, home address and phone" },
      {
        property: "og:description",
        content: "Your name, home address, phone number and the people you call.",
      },
    ],
  }),
  component: MyDetailsPage,
});

function MyDetailsPage() {
  const { value, save, ready } = useMyDetails();
  const [form, setForm] = useState<MyDetails>(value);
  const [saved, setSaved] = useState(false);
  const { value: people, save: savePeople } = usePeople();

  useEffect(() => {
    if (ready) setForm(value);
  }, [ready, value]);

  const set = (key: keyof MyDetails, v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setSaved(false);
  };

  return (
    <PageShell title="My details" intro="Who you are and where you live.">
      <form
        className="space-y-4 rounded-2xl border bg-card p-5"
        onSubmit={(event) => {
          event.preventDefault();
          save(form);
          setSaved(true);
        }}
      >
        <Field id="fullName" label="My full name" value={form.fullName} onChange={(v) => set("fullName", v)} />
        <Field
          id="dateOfBirth"
          label="My date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(v) => set("dateOfBirth", v)}
        />
        <div className="space-y-2">
          <Label htmlFor="address" className="text-base">
            My home address
          </Label>
          <Textarea
            id="address"
            className="min-h-28 text-base"
            maxLength={300}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        <Field
          id="phone"
          label="My phone number"
          type="tel"
          value={form.phone}
          onChange={(v) => set("phone", v)}
        />
        <Field
          id="email"
          label="My email"
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
        />
        <Button type="submit" className="h-16 w-full text-lg">
          Save my details
        </Button>
        {saved ? (
          <p role="status" className="text-center text-lg font-semibold text-primary">
            Saved. Well done.
          </p>
        ) : null}
      </form>

      <section className="mt-8" aria-labelledby="people">
        <h2 id="people" className="text-2xl font-bold">
          People I call
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Family, friends and helpers. Tap a name to call them.
        </p>

        <ul className="mt-4 space-y-3">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <a
                href={`tel:${person.phone.replace(/[^+\d]/g, "")}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Phone className="size-6 shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-xl font-bold">{person.name}</span>
                  <span className="block text-base text-muted-foreground">
                    {person.relation} · {person.phone}
                  </span>
                </span>
              </a>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${person.name}`}
                onClick={() => savePeople(people.filter((p) => p.id !== person.id))}
              >
                <Trash2 className="size-5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>

        <form
          className="mt-4 space-y-4 rounded-2xl border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const name = String(data.get("name") ?? "").trim();
            if (!name) return;
            savePeople([
              ...people,
              {
                id: newId(),
                name: name.slice(0, 80),
                relation: String(data.get("relation") ?? "").slice(0, 60),
                phone: String(data.get("phone") ?? "").slice(0, 40),
              },
            ]);
            event.currentTarget.reset();
          }}
        >
          <h3 className="text-xl font-bold">Add a person</h3>
          <div className="space-y-2">
            <Label htmlFor="p-name" className="text-base">
              Their name
            </Label>
            <Input id="p-name" name="name" required maxLength={80} className="h-14 text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-relation" className="text-base">
              Who are they? (mum, support worker…)
            </Label>
            <Input id="p-relation" name="relation" maxLength={60} className="h-14 text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-phone" className="text-base">
              Their phone number
            </Label>
            <Input
              id="p-phone"
              name="phone"
              type="tel"
              maxLength={40}
              className="h-14 text-base"
            />
          </div>
          <Button type="submit" variant="secondary" className="h-14 w-full text-base">
            <Plus className="size-5" aria-hidden="true" /> Add person
          </Button>
        </form>
      </section>
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
      <Input
        id={id}
        type={type}
        maxLength={120}
        className="h-14 text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
