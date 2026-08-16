import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadAloud } from "@/lib/speech";

/** Reads the words on this page out loud. */
export function ReadAloudButton({ targetId }: { targetId: string }) {
  const { supported, speaking, speak, stop } = useReadAloud();

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={speaking ? "destructive" : "secondary"}
      className="h-14 w-full text-base sm:w-auto"
      onClick={() => {
        if (speaking) {
          stop();
          return;
        }
        const el = document.getElementById(targetId);
        speak(el?.innerText ?? "");
      }}
    >
      {speaking ? (
        <>
          <Square className="size-5" aria-hidden="true" /> Stop reading
        </>
      ) : (
        <>
          <Volume2 className="size-5" aria-hidden="true" /> Read this page out loud
        </>
      )}
    </Button>
  );
}
