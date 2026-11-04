import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, ChevronRight, Wallet } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AccountSummary } from "@/components/account-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { accountKinds, newId, useAccounts, type Account } from "@/lib/local-store";

export const Route = createFileRoute("/accounts")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My accounts — My Life Folder" },
      {
        name: "description",
        content:
          "Add your bank, phone, energy and other accounts and see them all in one simple list.",
      },
      { property: "og:title", content: "My accounts — My Life Folder" },
      {
        property: "og:description",
        content: "All your accounts in one simple list. Tap one to see the details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountsPage,
});

const empty: Account = {
  id: "",
  name: "",
  kind: accountKinds[0] ?? "Other",
  username: "",
  website: "",
  phone: "",
  notes: "",
};

function AccountsPage() {
  const { value: accounts, save } = useAccounts();
  const [editing, setEditing] = useState<Account | null>(null);
  const [viewing, setViewing] = useState<Account | null>(null);

  const store = (account: Account) => {
    const exists = accounts.some((a) => a.id === account.id);
    save(
      exists ? accounts.map((a) => (a.id === account.id ? account : a)) : [...accounts, account],
    );
    setEditing(null);
  };

  const remove = (id: string) => {
    save(accounts.filter((a) => a.id !== id));
    setViewing(null);
  };

  return (
    <PageShell title="Saved accounts" intro="Your bank, bills and everyday account records.">
      <AccountSummary />
      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">
          Account records <span className="text-sm text-muted-foreground">({accounts.length})</span>
        </h2>
        <Button size="lg" className="h-11" onClick={() => setEditing({ ...empty, id: newId() })}>
          <Plus className="size-6" aria-hidden="true" /> Add an account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="border-y border-dashed py-8 text-center text-base text-muted-foreground">
          No saved account records yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {accounts.map((account) => (
            <li key={account.id}>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setViewing(account)}
                className="explore-tile flex h-auto w-full items-center gap-4 whitespace-normal rounded-lg border border-border/60 bg-card p-4 text-left hover:bg-secondary hover:text-foreground"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tile-accounts">
                  <Wallet className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xl font-bold">{account.name}</span>
                  <span className="block text-base text-muted-foreground">{account.kind}</span>
                </span>
                <ChevronRight className="size-6 shrink-0" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewing?.name}</DialogTitle>
            <DialogDescription className="text-base">{viewing?.kind}</DialogDescription>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-3">
              <Row label="My user name" value={viewing.username} />
              <Row label="Website" value={viewing.website} />
              <Row label="Phone number" value={viewing.phone} />
              <Row label="Notes" value={viewing.notes} />
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="h-14 flex-1 text-base"
                  onClick={() => {
                    setEditing(viewing);
                    setViewing(null);
                  }}
                >
                  Change
                </Button>
                <Button
                  variant="destructive"
                  className="h-14 flex-1 text-base"
                  onClick={() => remove(viewing.id)}
                >
                  <Trash2 className="size-5" aria-hidden="true" /> Delete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Account details</DialogTitle>
            <DialogDescription className="text-base">
              Fill in what you know. You can leave boxes empty. Never write your password here.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!editing.name.trim()) return;
                store({ ...editing, name: editing.name.trim().slice(0, 80) });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Name of the account
                </Label>
                <Input
                  id="name"
                  className="h-14 text-base"
                  maxLength={80}
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kind" className="text-base">
                  What kind is it?
                </Label>
                <select
                  id="kind"
                  className="h-14 w-full rounded-md border bg-background px-3 text-base"
                  value={editing.kind}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
                >
                  {accountKinds.map((kind) => (
                    <option key={kind}>{kind}</option>
                  ))}
                </select>
              </div>
              <FieldInput
                id="username"
                label="My user name or customer number"
                value={editing.username}
                onChange={(v) => setEditing({ ...editing, username: v })}
              />
              <FieldInput
                id="website"
                label="Website"
                value={editing.website}
                onChange={(v) => setEditing({ ...editing, website: v })}
              />
              <FieldInput
                id="phone"
                label="Their phone number"
                value={editing.phone}
                onChange={(v) => setEditing({ ...editing, phone: v })}
              />
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="min-h-28 text-base"
                  maxLength={500}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="h-16 w-full text-lg">
                Save
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function FieldInput({
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
      <Input
        id={id}
        className="h-14 text-base"
        maxLength={120}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-secondary/60 p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-lg">{value || "—"}</p>
    </div>
  );
}
