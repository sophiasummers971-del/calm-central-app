import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { MicButton } from "@/components/MicButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { newId, usePeople, useMyDetails, useConcerns, type MyDetails } from "@/lib/local-store";

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
        className="space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
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
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <Textarea
              id="address"
              className="min-h-28 flex-1 text-base"
              maxLength={300}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
            <MicButton
              label="my home address"
              onText={(text) =>
                set("address", (form.address ? `${form.address} ${text}` : text).slice(0, 300))
              }
            />
          </div>
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
            <li key={person.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 surface p-4">
              <a
                href={`tel:${person.phone.replace(/[^+\d]/g, "")}`}
                className="flex min-w-0 items-center gap-3"
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
                className="min-h-11 min-w-11 shrink-0"
                aria-label={`Delete ${person.name}`}
                onClick={() => savePeople(people.filter((p) => p.id !== person.id))}
              >
                <Trash2 className="size-5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>

        <form
          className="mt-4 space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
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

      <SavedConcerns />
    </PageShell>
  );
}

function SavedConcerns() {
  const { value: concerns, save } = useConcerns();
  const [newestFirst, setNewestFirst] = useState(true);
  const sorted = [...concerns].sort((a, b) =>
    newestFirst
      ? b.createdAt.localeCompare(a.createdAt)
      : a.createdAt.localeCompare(b.createdAt),
  );
  let lastMonth = "";
  return (
    <section
      aria-labelledby="concerns-title"
      className="mt-8 space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
    >
      <h2 id="concerns-title" className="font-display text-2xl font-bold">
        My health history
      </h2>
      <p className="text-base text-muted-foreground">
        Your saved notes in date order. Tap a note to read it.
      </p>
      {concerns.length === 0 ? (
        <p className="text-base">
          No notes yet.{" "}
          <Link to="/appointment" className="font-bold underline">
            Make an appointment note
          </Link>
        </p>
      ) : (
        <>
          {concerns.length > 1 ? (
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-full text-base"
              onClick={() => setNewestFirst((v) => !v)}
            >
              {newestFirst ? "Show oldest first" : "Show newest first"}
            </Button>
          ) : null}
          <ol className="relative space-y-3 border-l-2 border-primary/60 pl-5">
            {sorted.map((c) => {
              const d = new Date(c.createdAt);
              const month = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
              const showMonth = month !== lastMonth;
              lastMonth = month;
              return (
              <li key={c.id} className="relative">
                {showMonth ? (
                  <h3 className="mb-2 text-lg font-bold text-primary">{month}</h3>
                ) : null}
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.72rem] top-5 size-3 rounded-full bg-primary"
                />
                <div className="rounded-xl border border-border/50 bg-secondary/60 p-4">
                <details>
                  <summary className="cursor-pointer text-lg font-bold">
                    {c.summary.mainProblem}
                    <span className="block text-base font-normal">
                      {new Date(c.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2 text-base">
                    {c.summary.urgentWarning ? (
                      <p className="font-bold text-destructive">{c.summary.urgentWarning}</p>
                    ) : null}
                    <p><strong>How long:</strong> {c.summary.howLong}</p>
                    <NoteList title="What I feel" items={c.summary.symptoms} />
                    <NoteList title="Helps or makes it worse" items={c.summary.thingsThatHelpOrMakeItWorse} />
                    <NoteList title="Medicines" items={c.summary.medicinesMentioned} />
                    <NoteList title="Questions for the doctor" items={c.summary.questionsForTheDoctor} />
                    <p><strong>My own words:</strong> {c.original}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-12 w-full text-base"
                      onClick={() => {
                        if (window.confirm("Delete this note?"))
                          save(concerns.filter((x) => x.id !== c.id));
                      }}
                    >
                      <Trash2 className="size-5" aria-hidden="true" /> Delete this note
                    </Button>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <Link to="/appointment" className="inline-block text-lg font-bold underline">
            Add a new note
          </Link>
        </>
      )}
    </section>
  );
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <strong>{title}:</strong>
      <ul className="list-disc pl-5">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
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
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
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
