import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ThemeButtons } from "@/components/ThemeButtons";
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
          "Simple answers about every page, what happens if something goes wrong, and how to change the screen colours to light, dark or system.",
      },
      { property: "og:title", content: "Help and questions — My Life Folder" },
      {
        property: "og:description",
        content: "Plain answers for every page, common problems and how to fix them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

const pages = [
  {
    q: "What is the Home page for?",
    a: "Home shows big buttons for each part of your folder, and how much is filled in. Tap a button to open that part. At the bottom there is a quick way to call someone who helps you.",
  },
  {
    q: "What goes on the Accounts page?",
    a: "Every account you have: bank, phone, gas, water, internet, rent, benefits, insurance and shops. Write the name, the type, your username, the website and the phone number. Never write your password here — nobody should keep passwords in an app like this.",
  },
  {
    q: "What goes on the My details page?",
    a: "Your name, date of birth, home address, phone number and email. Under that you can add People I call, like family, a support worker or a neighbour. Tap a person to ring them straight away.",
  },
  {
    q: "What goes on the Emergency page?",
    a: "The things an ambulance or doctor needs fast: your GP surgery, NHS number, allergies, medicine you take, health conditions, the support you need and your blood type. There are also NHS buttons for 111, the NHS App, and finding a GP or pharmacy.",
  },
  {
    q: "What is on the Settings page?",
    a: "It shows what is saved, lets you make a backup file, bring a backup back, turn on bigger text, choose light or dark screen, and delete everything if you want to start again.",
  },
  {
    q: "What does signing in with email do?",
    a: "It makes the folder belong to your own account. Tap Sign in at the top of any page, put in your email and a password, and you stay signed in on that device until you sign out.",
  },
  {
    q: "Where is my information kept?",
    a: "On this device, in this browser. It is not shared with anybody. If you clear your browser data, or use a different phone or computer, the folder will look empty. That is why backups matter.",
  },
  {
    q: "How do I read a page out loud?",
    a: "Tap Read this page out loud at the top. Tap Stop reading to stop. It uses the voice built into your device.",
  },
  {
    q: "How do I speak instead of typing?",
    a: "In My details and Emergency, every box has a small microphone button. Tap it, say the words, and they appear in the box. Tap it again to stop.",
  },
];

const problems = [
  {
    q: "My information disappeared",
    a: "This happens when browser data was cleared, when private or incognito mode was used, or when you opened the app on a different device. Fix: open Settings and tap Bring a backup back, then choose your backup file. If you have no backup, the information has to be typed again — make a backup straight afterwards.",
  },
  {
    q: "Nothing saves when I type",
    a: "Your browser may be blocking storage, often in private mode or with strict privacy settings. Fix: close the private window, open the app in a normal window, and allow the site to store data in your browser settings.",
  },
  {
    q: "The read out loud button does nothing",
    a: "Some browsers block sound until you tap the page, and older browsers have no voice at all. Fix: tap anywhere on the page first, turn the volume up, take the phone off silent, then tap the button again. If it still does nothing, try Chrome, Edge or Safari.",
  },
  {
    q: "The microphone button will not listen",
    a: "The browser needs your permission and Firefox does not support this at all. Fix: when the browser asks for the microphone, choose Allow. If you said no before, open the padlock icon next to the web address and switch the microphone back on. On a phone, also check the app has microphone permission.",
  },
  {
    q: "My backup file will not load",
    a: "The message 'that file is not a My Life Folder backup' means the wrong file was picked. Fix: choose the file whose name starts with my-life-folder-backup and ends in .json. Do not rename it or open and edit it first.",
  },
  {
    q: "I cannot sign in",
    a: "Check the email is spelled correctly and there is no space at the end. If you just made the account, open the email we sent and tap the link first. If the password is wrong, make a new account with a different email, or ask for help resetting it.",
  },
  {
    q: "Tapping a phone number does nothing",
    a: "Calling only works on a device that can make calls. Fix: on a computer, read the number and dial it on your phone instead.",
  },
  {
    q: "The text is too small or too bright",
    a: "Tap Bigger, clearer text at the top of any page, and choose Dark below to soften the screen. Both stay on until you change them.",
  },
  {
    q: "The page looks broken or frozen",
    a: "Fix: pull down to refresh, or close the tab and open the app again. Your saved information stays where it is. If it keeps happening, restart the device.",
  },
];

function FaqPage() {
  return (
    <PageShell
      title="Help and questions"
      intro="Everything explained in plain words, plus what to do when something goes wrong."
    >
      <section className="rounded-2xl border bg-card p-5" aria-labelledby="screen">
        <h2 id="screen" className="text-2xl font-bold">
          Screen colours
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Choose Light, Dark, or System to follow your phone or computer.
        </p>
        <ThemeButtons className="mt-4" />
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5" aria-labelledby="pages">
        <h2 id="pages" className="text-2xl font-bold">
          How every page works
        </h2>
        <Accordion type="single" collapsible className="mt-2">
          {pages.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-lg font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5" aria-labelledby="problems">
        <h2 id="problems" className="text-2xl font-bold">
          Common problems and how to fix them
        </h2>
        <Accordion type="single" collapsible className="mt-2">
          {problems.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-lg font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mt-6 rounded-2xl border bg-tile-emergency p-5" aria-labelledby="urgent">
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
