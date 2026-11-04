import {
  BookOpen,
  CalendarDays,
  FolderOpen,
  HeartPulse,
  HelpCircle,
  Home,
  Leaf,
  Mail,
  Map,
  MessageSquare,
  Settings,
  Sparkles,
  Stethoscope,
  Target,
  User,
  UserRound,
  Wallet,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Your life",
    description: "The everyday essentials",
    items: [
      {
        to: "/my-details",
        label: "My details",
        detail: "Contact details & health history",
        icon: User,
      },
      {
        to: "/accounts",
        label: "Saved accounts",
        detail: "Bank, bills & useful contacts",
        icon: Wallet,
      },
      { to: "/inbox", label: "Inbox", detail: "Your Gmail messages", icon: Mail },
      { to: "/files", label: "Files", detail: "Your Google Drive documents", icon: FolderOpen },
      {
        to: "/calendar",
        label: "Calendar",
        detail: "Your Google appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Your health",
    description: "A little care, every day",
    items: [
      {
        to: "/health-journal",
        label: "Health journal",
        detail: "Mood, meals & symptoms",
        icon: BookOpen,
      },
      {
        to: "/emergency",
        label: "Emergency",
        detail: "Doctor, medication & allergies",
        icon: HeartPulse,
      },
      {
        to: "/appointment",
        label: "Appointment notes",
        detail: "Prepare for your next visit",
        icon: Sparkles,
      },
      {
        to: "/goal-progress",
        label: "Goal progress",
        detail: "Steps, water & sleep trends",
        icon: Target,
      },
      {
        to: "/symptom-checker",
        label: "Symptom checker",
        detail: "Find the right level of care",
        icon: Stethoscope,
      },
      {
        to: "/health-tips",
        label: "Health tips",
        detail: "Practical everyday guidance",
        icon: Leaf,
      },
      {
        to: "/wellness-guides",
        label: "Wellness guides",
        detail: "Small steps for wellbeing",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Your space",
    description: "Make it feel like yours",
    items: [
      { to: "/auth", label: "My account", detail: "Your identity & sign-in", icon: UserRound },
      {
        to: "/settings",
        label: "Settings",
        detail: "Appearance, reading & backups",
        icon: Settings,
      },
      { to: "/faq", label: "Help and FAQ", detail: "Answers & troubleshooting", icon: HelpCircle },
      {
        to: "/support",
        label: "Messages to help",
        detail: "Get in touch with a screenshot",
        icon: MessageSquare,
      },
      { to: "/sitemap", label: "All pages", detail: "The complete folder", icon: Map },
    ],
  },
] as const;

type NavigationItem = (typeof navigationGroups)[number]["items"][number];

export const navigationItems = [
  { to: "/", label: "Overview", detail: "Your whole folder", icon: Home },
  ...navigationGroups.flatMap<NavigationItem>((group) => [...group.items]),
] as const;
