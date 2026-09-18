import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type ThemeChoice } from "@/lib/theme";

const options: { value: ThemeChoice; label: string; help: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", help: "Bright screen", icon: Sun },
  { value: "dark", label: "Dark", help: "Dim screen", icon: Moon },
  { value: "system", label: "System", help: "Follow my device", icon: Laptop },
];

export function ThemeButtons({ className = "" }: { className?: string }) {
  const { choice, setTheme, ready } = useTheme();

  return (
    <div className={`grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 ${className}`} role="group" aria-label="Screen colours">
      {options.map(({ value, label, help, icon: Icon }) => {
        const active = ready && choice === value;
        return (
          <Button
            key={value}
            type="button"
            variant={active ? "default" : "secondary"}
            aria-pressed={active}
            className="h-auto flex-col gap-1 px-2 py-4 text-base"
            onClick={() => setTheme(value)}
          >
            <Icon className="size-6" aria-hidden="true" />
            <span className="font-bold">{label}</span>
            <span className="text-xs font-normal opacity-80">{help}</span>
          </Button>
        );
      })}
    </div>
  );
}
