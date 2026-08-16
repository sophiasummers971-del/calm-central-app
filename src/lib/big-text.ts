import { useCallback, useEffect, useState } from "react";

const KEY = "mycare.bigText";
const CLASS = "big-text";

function apply(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(CLASS, on);
}

export function useBigText() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = window.localStorage.getItem(KEY) === "on";
    } catch {
      /* storage blocked */
    }
    setOn(saved);
    apply(saved);
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      apply(next);
      try {
        window.localStorage.setItem(KEY, next ? "on" : "off");
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }, []);

  return { on, toggle, ready };
}
