import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBigText } from "@/lib/big-text";

export function BigTextButton({ className }: { className?: string }) {
  const { on, toggle } = useBigText();

  return (
    <Button
      type="button"
      variant={on ? "default" : "secondary"}
      className={className ?? "h-14 text-base"}
      aria-pressed={on}
      onClick={toggle}
    >
      <Type className="size-6" aria-hidden="true" />
      {on ? "Normal text" : "Bigger, clearer text"}
    </Button>
  );
}
