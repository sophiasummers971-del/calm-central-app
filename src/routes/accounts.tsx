import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, ChevronRight, Wallet } from "lucide-react";
import { PageShell } from "@/components/PageShell";
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
    ],
  }),
  component: AccountsPage,
});

const empty: Account = {
  id: "",
  name: "",
  kind: accountKinds[0]!,
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
    save(exists ? accounts.map((a) => (a.id === account.id ? account : a)) : [...accounts, account]);
    setEditing(null);
  };

  const remove = (id: string) => {
    save(accounts.filter((a) => a.id !== id));
    setViewing(null);
  };

  return (
    <PageShell
      title="My accounts"
      intro="Every account you have, in one list. Tap one to see the details."
    >
      <Button
        size="lg"
        className="h-16 w-full text-lg"
        onClick={() => setEditing({ ...empty, id: newId() })}
      >
        <Plus className="size-6" aria-hidden="true" /> Add an account
      </Button>

      {accounts.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed p-6 text-center text-lg text-muted-foreground">
          No accounts yet. Press the green button above to add your first one.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => setViewing(account)}
                className="flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tile-accounts">
                  <Wallet className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xl font-bold">{account.name}</span>
                  <span className="block text-base text-muted-foreground">{account.kind}</span>
                </span>
                <ChevronRight className="size-6 shrink-0" aria-hidden="true" />
              </button>
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
    <div className="rounded-xl bg-muted p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-lg">{value || "—"}</p>
    </div>
  );
}
