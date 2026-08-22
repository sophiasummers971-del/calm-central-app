import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ThemeButtons } from "@/components/ThemeButtons";
import { SupportForm } from "@/components/SupportForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Help and questions — My Life Folder" },
      {
        name: "description",
        content:
          "Search plain answers about every page, follow step-by-step fixes for common errors, change screen colours, or send us a message with a screenshot.",
      },
      { property: "og:title", content: "Help and questions — My Life Folder" },
      {
        property: "og:description",
        content: "Search answers, follow step-by-step fixes, or send us a message for help.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

type AppRoute = "/" | "/accounts" | "/my-details" | "/emergency" | "/settings" | "/auth";

const pages: { q: string; a: string; keywords: string }[] = [
  {
    q: "What is the Home page for?",
    a: "Home shows big buttons for each part of your folder, and how much is filled in. Tap a button to open that part. At the bottom there is a quick way to call someone who helps you.",
    keywords: "home dashboard start tiles buttons overview",
  },
  {
    q: "What goes on the Accounts page?",
    a: "Every account you have: bank, phone, gas, water, internet, rent, benefits, insurance and shops. Write the name, the type, your username, the website and the phone number. Never write your password here — nobody should keep passwords in an app like this.",
    keywords: "accounts bank bills energy password username website",
  },
  {
    q: "What goes on the My details page?",
    a: "Your name, date of birth, home address, phone number and email. Under that you can add People I call, like family, a support worker or a neighbour. Tap a person to ring them straight away.",
    keywords: "details name address phone email contacts people call",
  },
  {
    q: "What goes on the Emergency page?",
    a: "The things an ambulance or doctor needs fast: your GP surgery, NHS number, allergies, medicine you take, health conditions, the support you need and your blood type. There are also NHS buttons for 111, the NHS App, and finding a GP or pharmacy.",
    keywords: "emergency gp nhs 111 allergies medicine blood doctor ambulance",
  },
  {
    q: "What is on the Settings page?",
    a: "It shows what is saved, lets you make a backup file, bring a backup back, turn on bigger text, choose light or dark screen, and delete everything if you want to start again.",
    keywords: "settings backup restore delete big text theme",
  },
  {
    q: "What does signing in with email do?",
    a: "It makes the folder belong to your own account. Tap Sign in at the top of any page, put in your email and a password, and you stay signed in on that device until you sign out.",
    keywords: "sign in login account email password",
  },
  {
    q: "Where is my information kept?",
    a: "On this device, in this browser. It is not shared with anybody. If you clear your browser data, or use a different phone or computer, the folder will look empty. That is why backups matter.",
    keywords: "storage privacy device browser saved data",
  },
  {
    q: "How do I read a page out loud?",
    a: "Tap Read this page out loud at the top. Tap Stop reading to stop. It uses the voice built into your device.",
    keywords: "read aloud speech voice sound listen",
  },
  {
    q: "How do I speak instead of typing?",
    a: "In My details and Emergency, every box has a small microphone button. Tap it, say the words, and they appear in the box. Tap it again to stop.",
    keywords: "microphone dictation speak typing voice to text",
  },
];

type Problem = {
  id: string;
  q: string;
  a: string;
  keywords: string;
  steps: string[];
  to?: AppRoute;
  toLabel?: string;
};

const problems: Problem[] = [
  {
    id: "lost-info",
    q: "My information disappeared",
    a: "This happens when browser data was cleared, when private or incognito mode was used, or when you opened the app on a different device.",
    keywords: "gone missing empty lost cleared data disappeared blank",
    steps: [
      "Open the Settings page.",
      "Tap Bring a backup back.",
      "Choose the file whose name starts with my-life-folder-backup.",
      "Check your pages again — your information should be back.",
      "If you had no backup, type the information again and then tap Make a backup file straight away.",
    ],
    to: "/settings",
    toLabel: "Go to Settings",
  },
  {
    id: "not-saving",
    q: "Nothing saves when I type",
    a: "Your browser may be blocking storage, often in private mode or with strict privacy settings.",
    keywords: "save saving not working private incognito storage blocked",
    steps: [
      "Close any private or incognito window.",
      "Open the app again in a normal window.",
      "In your browser settings, allow this site to store data.",
      "Type one word in a box, leave the page and come back to check it stayed.",
    ],
    to: "/my-details",
    toLabel: "Go to My details",
  },
  {
    id: "read-aloud",
    q: "The read out loud button does nothing",
    a: "Some browsers block sound until you tap the page, and older browsers have no voice at all.",
    keywords: "read aloud speech no sound silent voice mute",
    steps: [
      "Tap anywhere on the page once.",
      "Turn the volume up and take the phone off silent.",
      "Tap Read this page out loud again.",
      "If it still says nothing, try the app in Chrome, Edge or Safari.",
    ],
    to: "/",
    toLabel: "Back to Home",
  },
  {
    id: "microphone",
    q: "The microphone button will not listen",
    a: "The browser needs your permission, and Firefox does not support this at all.",
    keywords: "microphone mic dictation permission denied speak firefox",
    steps: [
      "Tap the microphone button and choose Allow when the browser asks.",
      "If you said no before, tap the padlock next to the web address and switch the microphone back on.",
      "On a phone, check the browser app has microphone permission in your phone settings.",
      "If you use Firefox, open the app in Chrome, Edge or Safari instead.",
    ],
    to: "/my-details",
    toLabel: "Go to My details",
  },
  {
    id: "backup-file",
    q: "My backup file will not load",
    a: "The message 'that file is not a My Life Folder backup' means the wrong file was picked.",
    keywords: "backup restore file json wrong error load import",
    steps: [
      "Open Settings and tap Bring a backup back.",
      "Choose the file starting with my-life-folder-backup and ending in .json.",
      "Do not rename the file or edit it first.",
      "If it still fails, make a fresh backup on the device that still has your information.",
    ],
    to: "/settings",
    toLabel: "Go to Settings",
  },
  {
    id: "sign-in",
    q: "I cannot sign in",
    a: "Usually the email has a typo, or the account was never confirmed.",
    keywords: "sign in login password email account error confirm",
    steps: [
      "Check the email is spelled correctly with no space at the end.",
      "If you just made the account, open the email we sent and tap the link.",
      "Type the password slowly, watching for capital letters.",
      "If the password is lost, send us a message at the bottom of this page and we will help.",
    ],
    to: "/auth",
    toLabel: "Go to Sign in",
  },
  {
    id: "phone-call",
    q: "Tapping a phone number does nothing",
    a: "Calling only works on a device that can make calls.",
    keywords: "call phone number dial tap not working computer",
    steps: [
      "On a phone, check the number is written with digits only, like 07700900123.",
      "On a computer, read the number and dial it on your phone instead.",
      "For urgent health worries call 111, and in an emergency call 999.",
    ],
    to: "/emergency",
    toLabel: "Go to Emergency",
  },
  {
    id: "text-size",
    q: "The text is too small or too bright",
    a: "The app has bigger text and darker screen settings built in.",
    keywords: "text size small bright dark light contrast reading eyes",
    steps: [
      "Tap Bigger, clearer text at the top of any page.",
      "Choose Dark in the Screen colours section above.",
      "Both settings stay on until you change them again.",
    ],
    to: "/settings",
    toLabel: "Go to Settings",
  },
  {
    id: "frozen",
    q: "The page looks broken or frozen",
    a: "A refresh nearly always fixes this, and your saved information stays where it is.",
    keywords: "broken frozen stuck blank white crash refresh reload",
    steps: [
      "Pull down to refresh, or close the tab and open the app again.",
      "If it keeps happening, restart the device.",
      "Still stuck? Send us a message below with a picture of the screen.",
    ],
    to: "/",
    toLabel: "Back to Home",
  },
];

function matches(query: string, ...fields: string[]) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fields.join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}

function FaqPage() {
  const [query, setQuery] = useState("");
  const search = query.trim().slice(0, 100);

  const shownPages = useMemo(
    () => pages.filter((item) => matches(search, item.q, item.a, item.keywords)),
    [search],
  );
  const shownProblems = useMemo(
    () =>
      problems.filter((item) =>
        matches(search, item.q, item.a, item.keywords, item.steps.join(" ")),
      ),
    [search],
  );

  const nothingFound = shownPages.length === 0 && shownProblems.length === 0;

  return (
    <PageShell
      title="Help and questions"
      intro="Search for your problem, follow the steps, or send us a message."
    >
      <section className="rounded-2xl border border-border/60 surface p-5" aria-labelledby="search-help">
        <h2 id="search-help" className="text-2xl font-bold">
          Search for help
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Type a word like backup, microphone, sign in or dark.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              maxLength={100}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What went wrong?"
              aria-label="Search the help page"
              className="h-14 pl-12 text-lg"
            />
          </div>
          {search ? (
            <Button
              type="button"
              variant="secondary"
              className="h-14 text-lg"
              onClick={() => setQuery("")}
            >
              <X className="size-5" aria-hidden="true" /> Clear
            </Button>
          ) : null}
        </div>
        {search ? (
          <p className="mt-3 text-base font-semibold" aria-live="polite">
            {shownProblems.length} fix{shownProblems.length === 1 ? "" : "es"} and{" "}
            {shownPages.length} answer{shownPages.length === 1 ? "" : "s"} found.
          </p>
        ) : null}
      </section>

      {nothingFound ? (
        <section className="mt-6 rounded-2xl border border-border/60 surface p-5">
          <h2 className="text-2xl font-bold">Nothing matched “{search}”</h2>
          <p className="mt-1 text-base">
            Try a simpler word, or scroll down and send us a message — we will answer by email.
          </p>
          <Button className="mt-4 h-14 text-lg" onClick={() => setQuery("")}>
            Show all help
          </Button>
        </section>
      ) : null}

      {shownProblems.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-border/60 surface p-5" aria-labelledby="problems">
          <h2 id="problems" className="text-2xl font-bold">
            Common problems
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Open a problem, then tap the button to jump to the steps that fix it.
          </p>
          <Accordion type="single" collapsible className="mt-2">
            {shownProblems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">
                  <p>{item.a}</p>
                  <a
                    href={`#fix-${item.id}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-base font-bold"
                  >
                    Show me the steps
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </a>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}

      {shownProblems.length > 0 ? (
        <section className="mt-6" aria-labelledby="fixes">
          <h2 id="fixes" className="text-2xl font-bold">
            Step-by-step fixes
          </h2>
          <div className="mt-3 space-y-4">
            {shownProblems.map((item) => (
              <article
                key={item.id}
                id={`fix-${item.id}`}
                className="scroll-mt-24 rounded-2xl border border-border/60 surface p-5"
              >
                <h3 className="text-xl font-bold">{item.q}</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-6 text-base leading-relaxed">
                  {item.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-4 text-lg font-bold text-primary-foreground"
                  >
                    {item.toLabel}
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {shownPages.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-border/60 surface p-5" aria-labelledby="pages">
          <h2 id="pages" className="text-2xl font-bold">
            How every page works
          </h2>
          <Accordion type="single" collapsible className="mt-2">
            {shownPages.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-border/60 surface p-5" aria-labelledby="screen">
        <h2 id="screen" className="text-2xl font-bold">
          Screen colours
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Choose Light, Dark, or System to follow your phone or computer.
        </p>
        <ThemeButtons className="mt-4" />
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 surface p-5" aria-labelledby="contact">
        <h2 id="contact" className="text-2xl font-bold">
          Still stuck? Send us a message
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Describe the problem, add a picture of the screen if you can, and we will reply to your
          email.
        </p>
        <SupportForm />
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-tile-emergency glow-edge p-5" aria-labelledby="urgent">
        <h2 id="urgent" className="text-2xl font-bold">
          If you need help now
        </h2>
        <p className="mt-1 text-base">
          For health worries call 111. In an emergency call 999. Your doctor and helper numbers are
          on the{" "}
          <Link to="/emergency" className="font-bold underline">
            Emergency page
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
