import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDictation } from "@/lib/speech";

/** A big microphone button: speak and the words go into the box. */
export function MicButton({
  label,
  onText,
}: {
  label: string;
  onText: (text: string) => void;
}) {
  const { supported, listening, start, stop } = useDictation(onText);

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "secondary"}
      className="h-14 shrink-0 px-4 text-base"
      aria-label={listening ? `Stop listening for ${label}` : `Speak ${label}`}
      onClick={() => (listening ? stop() : start())}
    >
      {listening ? (
        <>
          <Square className="size-5" aria-hidden="true" /> Stop
        </>
      ) : (
        <>
          <Mic className="size-5" aria-hidden="true" /> Speak
        </>
      )}
    </Button>
  );
}
