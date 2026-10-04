import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Conta de 0 até `value` na primeira exibição e, depois, entre o valor anterior e o novo
 * (por exemplo, ao trocar o filtro). Com prefers-reduced-motion mostra o valor direto.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 800,
}: {
  value: number;
  format: (value: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = value;
      setDisplay(value);
      return;
    }

    const from = current.current;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      current.current = from + (value - from) * easeOutCubic(progress);
      setDisplay(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{format(display)}</>;
}
