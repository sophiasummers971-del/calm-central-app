import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { newId, useJournal } from "@/lib/local-store";
import { journalEntrySchema, journalMoods, sortJournalEntries, type JournalEntry } from "@/lib/health-journal";

export const Route = createFileRoute("/health-journal")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Health journal — My Life Folder" },
    { name: "description", content: "Keep dated personal notes about your mood, food and symptoms in your health journal." },
    { property: "og:title", content: "Health journal — My Life Folder" },
    { property: "og:description", content: "Keep your mood, food and symptom notes together, ordered by date." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: HealthJournalPage,
});

function HealthJournalPage() {
  const { value: entries, save, ready } = useJournal();
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [mood, setMood] = useState<JournalEntry["mood"]>(null);
  const [food, setFood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState<JournalEntry | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setDate(new Date()); setMood(null); setFood(""); setSymptoms(""); setEditing(null); setError("");
  };
  const edit = (entry: JournalEntry) => {
    setEditing(entry); setDate(parseISO(entry.date)); setMood(entry.mood); setFood(entry.food); setSymptoms(entry.symptoms);
    setError(""); setMessage("");
    document.getElementById("journal-form")?.scrollIntoView({ block: "start" });
    document.getElementById("journal-form-title")?.focus();
  };

  return (
    <PageShell title="Health journal">
      <p className="mb-6 text-muted-foreground">Personal notes · Saved on this device only, not synced to your account.</p>
      <form id="journal-form" className="scroll-mt-24 border-y border-border py-6" onSubmit={(event) => {
        event.preventDefault();
        const result = journalEntrySchema.safeParse({ id: editing?.id ?? newId(), date: date ? format(date, "yyyy-MM-dd") : "", mood, food, symptoms, createdAt: editing?.createdAt ?? new Date().toISOString() });
        if (!result.success) { setError(result.error.issues[0]?.message ?? "Check your entry."); return; }
        try {
          window.localStorage.setItem("mycare.journal", JSON.stringify([result.data, ...entries.filter((entry) => entry.id !== result.data.id)]));
        } catch { setError("Your entry could not be saved. Device storage may be full or blocked."); return; }
        save([result.data, ...entries.filter((entry) => entry.id !== result.data.id)]);
        setMessage(editing ? "Entry updated." : "Entry saved."); reset();
      }}>
        <h2 id="journal-form-title" tabIndex={-1} className="font-display text-xl font-bold">{editing ? "Edit entry" : "New entry"}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="journal-date">Date</Label>
            <Popover><PopoverTrigger asChild><Button id="journal-date" variant="outline" className="w-full justify-start" suppressHydrationWarning><CalendarDays aria-hidden="true" />{date ? format(date, "dd/MM/yyyy") : "Choose a date"}</Button></PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} className="pointer-events-auto p-3" /></PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="journal-mood">Mood</Label>
            <Select value={mood ?? "none"} onValueChange={(value) => setMood(journalMoods.find((item) => item === value) ?? null)}>
              <SelectTrigger id="journal-mood" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Not recorded</SelectItem>{journalMoods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="journal-food">Food and drink</Label><Textarea id="journal-food" value={food} onChange={(event) => setFood(event.target.value)} maxLength={4000} rows={3} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="journal-symptoms">Symptoms</Label><Textarea id="journal-symptoms" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} maxLength={4000} rows={3} /></div>
        </div>
        {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><Button type="submit" disabled={!ready}>{editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}{editing ? "Save changes" : "Save entry"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
      </form>
      <p role="status" className="mt-3 text-primary">{message}</p>
      <section className="mt-6" aria-labelledby="journal-history-title">
        <h2 id="journal-history-title" className="font-display text-xl font-bold">My entries</h2>
        {!ready ? <p className="mt-4 text-muted-foreground">Loading entries…</p> : entries.length === 0 ? <p className="mt-4 text-muted-foreground">No entries yet.</p> : <ol className="mt-4 space-y-4">{sortJournalEntries(entries).map((entry) => (
          <li key={entry.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-display font-semibold"><time dateTime={entry.date}>{format(parseISO(entry.date), "dd/MM/yyyy")}</time></h3><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Edit entry ${format(parseISO(entry.date), "dd/MM/yyyy")}`} onClick={() => edit(entry)} title="Edit entry"><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`Delete entry ${format(parseISO(entry.date), "dd/MM/yyyy")}`} onClick={() => setDeleting(entry)} title="Delete entry"><Trash2 /></Button></div></div>
            <dl className="mt-3 space-y-3">{entry.mood && <div><dt className="text-sm font-semibold text-muted-foreground">Mood</dt><dd>{entry.mood}</dd></div>}{entry.food && <div><dt className="text-sm font-semibold text-muted-foreground">Food and drink</dt><dd className="whitespace-pre-wrap break-words">{entry.food}</dd></div>}{entry.symptoms && <div><dt className="text-sm font-semibold text-muted-foreground">Symptoms</dt><dd className="whitespace-pre-wrap break-words">{entry.symptoms}</dd></div>}</dl>
          </li>
        ))}</ol>}
      </section>
      <AlertDialog open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this entry?</AlertDialogTitle><AlertDialogDescription>This permanently removes this journal entry from this device.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep entry</AlertDialogCancel><AlertDialogAction onClick={() => { if (!deleting) return; const next = entries.filter((entry) => entry.id !== deleting.id); try { window.localStorage.setItem("mycare.journal", JSON.stringify(next)); } catch { setError("The entry could not be deleted. Device storage may be blocked."); return; } save(next); if (editing?.id === deleting.id) reset(); setMessage("Entry deleted."); setDeleting(null); }}>Delete entry</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </PageShell>
  );
}