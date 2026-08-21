import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Image as ImageIcon, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSessionUser } from "@/lib/auth";
import {
  getIsAdmin,
  listSupportRequests,
  updateSupportRequest,
  type SupportRequestRow,
  type SupportStatus,
} from "@/lib/support-admin.functions";

const STATUS_OPTIONS: { key: SupportStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

function StatusCard({
  row,
  onSaved,
}: {
  row: SupportRequestRow;
  onSaved: () => void;
}) {
  const saveFn = useServerFn(updateSupportRequest);
  const [status, setStatus] = useState<SupportStatus>(row.status);
  const [notes, setNotes] = useState(row.resolver_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const save = async (nextStatus: SupportStatus) => {
    setSaving(true);
    setSaved(false);
    setFailed(false);
    try {
      await saveFn({ data: { id: row.id, status: nextStatus, resolverNotes: notes } });
      setSaved(true);
      onSaved();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border bg-background p-4">
      <p className="text-lg font-semibold">Where is this up to?</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            type="button"
            variant={status === opt.key ? "default" : "outline"}
            className="h-12 text-base"
            disabled={saving}
            onClick={() => {
              setStatus(opt.key);
              void save(opt.key);
            }}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <Label htmlFor={`notes-${row.id}`} className="mt-4 block text-lg font-semibold">
        Notes from the person helping
      </Label>
      <Textarea
        id={`notes-${row.id}`}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="What you did, or what needs doing next."
        className="mt-2 text-lg"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          className="h-12 text-base"
          disabled={saving}
          onClick={() => void save(status)}
        >
          {saving ? "Saving…" : "Save notes"}
        </Button>
        {saved ? <span className="text-base text-muted-foreground">Saved.</span> : null}
        {failed ? (
          <span className="text-base text-destructive">Sorry, that did not save.</span>
        ) : null}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Support inbox — admin view" },
      {
        name: "description",
        content:
          "Admin page to read support messages people have sent, filter them and open any screenshots they attached.",
      },
      { property: "og:title", content: "Support inbox — admin view" },
      {
        property: "og:description",
        content: "Read, search and filter support messages and screenshot uploads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type TimeFilter = "all" | "7" | "30";

function AdminPage() {
  const { user, ready } = useSessionUser();
  const isAdminFn = useServerFn(getIsAdmin);
  const listFn = useServerFn(listSupportRequests);

  const adminQuery = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => isAdminFn(),
    enabled: Boolean(user),
  });

  const isAdmin = adminQuery.data?.isAdmin === true;

  const requestsQuery = useQuery({
    queryKey: ["support-requests"],
    queryFn: () => listFn(),
    enabled: isAdmin,
  });

  const [search, setSearch] = useState("");
  const [withScreenshot, setWithScreenshot] = useState(false);
  const [time, setTime] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<SupportStatus | "all">("all");

  const rows = useMemo(() => {
    const all = requestsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    const cutoff =
      time === "all" ? 0 : Date.now() - Number(time) * 24 * 60 * 60 * 1000;

    return all.filter((r) => {
      if (withScreenshot && !r.screenshot_path) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (cutoff && new Date(r.created_at).getTime() < cutoff) return false;
      if (!q) return true;
      return (
        r.email.toLowerCase().includes(q) ||
        (r.topic ?? "").toLowerCase().includes(q)
      );
    });
  }, [requestsQuery.data, search, withScreenshot, time, statusFilter]);

  return (
    <PageShell
      title="Support inbox"
      intro="Messages people have sent from the Help page. Search by email or subject, and open any screenshot they added."
    >
      {!ready ? (
        <p className="text-lg">Checking your account…</p>
      ) : !user ? (
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-lg">You need to sign in to see this page.</p>
          <Link
            to="/auth"
            className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-lg font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      ) : adminQuery.isPending ? (
        <p className="text-lg">Checking your access…</p>
      ) : !isAdmin ? (
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-lg font-semibold">This page is for support staff only.</p>
          <p className="mt-2 text-base text-muted-foreground">
            Your account does not have admin access. If you think this is wrong, ask for the
            admin role to be added to your account.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <Label htmlFor="admin-search" className="text-lg font-semibold">
                Search by email or subject
              </Label>
              <div className="relative mt-2">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="admin-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. name@email.com or microphone"
                  className="h-14 pl-12 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {(
                [
                  { key: "all", label: "All time" },
                  { key: "7", label: "Last 7 days" },
                  { key: "30", label: "Last 30 days" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  variant={time === opt.key ? "default" : "outline"}
                  className="h-12 text-base"
                  onClick={() => setTime(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
              <Button
                type="button"
                variant={withScreenshot ? "default" : "outline"}
                className="h-12 text-base"
                onClick={() => setWithScreenshot((v) => !v)}
              >
                <ImageIcon className="mr-2 size-5" aria-hidden="true" />
                With screenshot
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 text-base"
                onClick={() => requestsQuery.refetch()}
              >
                <RefreshCw className="mr-2 size-5" aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </div>

          {requestsQuery.isPending ? (
            <p className="text-lg">Loading messages…</p>
          ) : requestsQuery.isError ? (
            <p className="text-lg text-destructive">
              Sorry, the messages could not be loaded. Please try Refresh.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-lg">No messages match what you are looking for.</p>
          ) : (
            <>
              <p className="text-base text-muted-foreground">
                Showing {rows.length} of {requestsQuery.data?.length ?? 0} messages.
              </p>
              <ul className="space-y-4">
                {rows.map((r) => (
                  <li key={r.id} className="rounded-2xl border bg-card p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-xl font-bold">{r.topic || "No subject"}</h2>
                      <span className="text-base text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-base font-semibold">{r.email}</p>
                    <p className="mt-3 whitespace-pre-wrap text-lg">{r.message}</p>
                    {r.screenshot_url ? (
                      <a
                        href={r.screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block"
                      >
                        <img
                          src={r.screenshot_url}
                          alt={`Screenshot sent with the message about ${r.topic || "a problem"}`}
                          className="max-h-64 rounded-xl border"
                          loading="lazy"
                        />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}
