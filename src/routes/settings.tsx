import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BigTextButton } from "@/components/BigTextButton";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  emptyDetails,
  emptyHealth,
  useAccounts,
  useHealthInfo,
  useMyDetails,
  usePeople,
  type Account,
  type HealthInfo,
  type MyDetails,
  type Person,
} from "@/lib/local-store";

export const Route = createFileRoute("/settings")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Settings — see, back up or clear your information" },
      {
        name: "description",
        content:
          "See everything saved on this device, make a backup file, bring a backup back, or delete all your information.",
      },
      { property: "og:title", content: "Settings — see, back up or clear your information" },
      {
        property: "og:description",
        content: "See what is saved, make a backup, or delete everything on this device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

type Backup = {
  app: "my-life-folder";
  savedAt: string;
  accounts: Account[];
  people: Person[];
  details: MyDetails;
  health: HealthInfo;
};

function countFilled(record: Record<string, string>) {
  return Object.values(record).filter((v) => v.trim() !== "").length;
}

function SettingsPage() {
  const { value: accounts, save: saveAccounts } = useAccounts();
  const { value: people, save: savePeople } = usePeople();
  const { value: details, save: saveDetails } = useMyDetails();
  const { value: health, save: saveHealth } = useHealthInfo();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const rows = [
    { label: "Accounts saved", value: `${accounts.length}` },
    { label: "People I call", value: `${people.length}` },
    {
      label: "My details filled in",
      value: `${countFilled(details as unknown as Record<string, string>)} of 5 boxes`,
    },
    {
      label: "Emergency information filled in",
      value: `${countFilled(health as unknown as Record<string, string>)} of 9 boxes`,
    },
  ];

  const backup = () => {
    const data: Backup = {
      app: "my-life-folder",
      savedAt: new Date().toISOString(),
      accounts,
      people,
      details,
      health,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-life-folder-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup file saved to your device.");
  };

  const restore = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Partial<Backup>;
      if (data.app !== "my-life-folder") throw new Error("wrong file");
      saveAccounts(Array.isArray(data.accounts) ? data.accounts : []);
      savePeople(Array.isArray(data.people) ? data.people : []);
      saveDetails({ ...emptyDetails, ...(data.details ?? {}) });
      saveHealth({ ...emptyHealth, ...(data.health ?? {}) });
      setMessage("Your backup is back. Everything is here again.");
    } catch {
      setMessage("Sorry, that file is not a My Life Folder backup.");
    }
  };

  const clearAll = () => {
    saveAccounts([]);
    savePeople([]);
    saveDetails(emptyDetails);
    saveHealth(emptyHealth);
    setMessage("Everything on this device was deleted.");
  };

  return (
    <PageShell title="Settings" intro="See what is saved, keep a copy safe, or start again.">
      <section className="rounded-2xl border border-border/60 surface p-4 sm:p-5" aria-labelledby="stored">
        <h2 id="stored" className="text-2xl font-bold">
          What is saved here
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Everything is kept only on this device. Nobody else can see it.
        </p>
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="grid grid-cols-1 gap-1 rounded-xl border border-border/50 bg-secondary/60 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
              <span className="text-base">{row.label}</span>
              <span className="text-lg font-bold">{row.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-3 rounded-2xl border border-border/60 surface p-4 sm:p-5" aria-labelledby="reading">
        <h2 id="reading" className="text-2xl font-bold">
          Easier reading
        </h2>
        <p className="text-base text-muted-foreground">
          Turn on bigger text with stronger colours. It stays on until you turn it off.
        </p>
        <BigTextButton className="h-16 w-full text-lg" />
        <p className="text-base text-muted-foreground">Have this page read out loud to you.</p>
        <ReadAloudButton targetId="page-content" />
      </section>

      <section className="mt-6 space-y-3 rounded-2xl border border-border/60 surface p-4 sm:p-5" aria-labelledby="backup">
        <h2 id="backup" className="text-2xl font-bold">
          Back up my information
        </h2>
        <p className="text-base text-muted-foreground">
          This makes one file you can keep safe. Later you can bring it back.
        </p>
        <Button className="h-16 w-full text-lg" onClick={backup}>
          <Download className="size-6" aria-hidden="true" /> Make a backup file
        </Button>
        <Button
          variant="secondary"
          className="h-16 w-full text-lg"
          onClick={() => fileInput.current?.click()}
        >
          <Upload className="size-6" aria-hidden="true" /> Bring a backup back
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void restore(file);
            event.target.value = "";
          }}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-tile-emergency glow-edge p-4 sm:p-5" aria-labelledby="clear">
        <h2 id="clear" className="text-2xl font-bold">
          Delete everything
        </h2>
        <p className="mt-1 text-base">
          This removes all your accounts, details and emergency information from this device. It
          cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 h-16 w-full text-lg font-bold">
              <Trash2 className="size-6" aria-hidden="true" /> Delete all my information
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Everything will be gone. Make a backup first if you want to keep it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-14 text-base">No, keep it</AlertDialogCancel>
              <AlertDialogAction className="h-14 text-base" onClick={clearAll}>
                Yes, delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {message ? (
        <p role="status" className="mt-6 rounded-xl bg-secondary p-4 text-center text-lg font-semibold">
          {message}
        </p>
      ) : null}
    </PageShell>
  );
}
