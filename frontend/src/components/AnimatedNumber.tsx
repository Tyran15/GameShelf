import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const DURATION_MS = 800;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const formatInteger = (value: number) => Math.round(value).toString();

/**
 * Exibe um número que "sobe" até o valor final (ou muda direto se houver reduced motion).
 * `format` recebe o valor atual da animação; o padrão mostra inteiros.
 */
export function AnimatedNumber({
  value,
  format = formatInteger,
}: {
  value: number;
  format?: (value: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      currentRef.current = value;
      setDisplay(value);
      return;
    }

    const from = currentRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const next = progress < 1 ? from + (value - from) * easeOutCubic(progress) : value;
      currentRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{format(display)}</span>;
}
