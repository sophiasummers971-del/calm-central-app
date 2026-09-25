import { useCallback, useEffect, useState } from "react";

export type Account = {
  id: string;
  name: string;
  kind: string;
  username: string;
  website: string;
  phone: string;
  notes: string;
};

export type Person = {
  id: string;
  name: string;
  relation: string;
  phone: string;
};

export type MyDetails = {
  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
};

export type HealthInfo = {
  gpName: string;
  gpPhone: string;
  gpAddress: string;
  nhsNumber: string;
  allergies: string;
  medication: string;
  conditions: string;
  supportNeeds: string;
  bloodType: string;
};

const KEYS = {
  accounts: "mycare.accounts",
  people: "mycare.people",
  details: "mycare.details",
  health: "mycare.health",
} as const;

export const emptyDetails: MyDetails = {
  fullName: "",
  dateOfBirth: "",
  address: "",
  phone: "",
  email: "",
};

export const emptyHealth: HealthInfo = {
  gpName: "",
  gpPhone: "",
  gpAddress: "",
  nhsNumber: "",
  allergies: "",
  medication: "",
  conditions: "",
  supportNeeds: "",
  bloodType: "",
};

export const accountKinds = [
  "Bank",
  "Phone",
  "Electricity or Gas",
  "Water",
  "Internet or TV",
  "Rent or Housing",
  "Benefits",
  "Insurance",
  "Shop or Online",
  "Other",
];

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore unreadable data */
    }
    setReady(true);
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage full or blocked */
      }
    },
    [key],
  );

  return { value, save, ready };
}

export type SavedConcern = {
  id: string;
  createdAt: string;
  original: string;
  summary: {
    mainProblem: string;
    howLong: string;
    symptoms: string[];
    thingsThatHelpOrMakeItWorse: string[];
    medicinesMentioned: string[];
    questionsForTheDoctor: string[];
    urgentWarning: string | null;
  };
};

export const useAccounts = () => useStored<Account[]>(KEYS.accounts, []);
export const usePeople = () => useStored<Person[]>(KEYS.people, []);
export const useMyDetails = () => useStored<MyDetails>(KEYS.details, emptyDetails);
export const useHealthInfo = () => useStored<HealthInfo>(KEYS.health, emptyHealth);
export const useConcerns = () => useStored<SavedConcern[]>("mycare.concerns", []);

export type HealthGoal = {
  id: string;
  label: string;
  target: number;
  unit: string;
  // progress per day, keyed by YYYY-MM-DD
  progress: Record<string, number>;
};

export const useGoals = () => useStored<HealthGoal[]>("mycare.goals", []);

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
