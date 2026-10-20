import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

// Sem 0/O, 1/I/L: caracteres que se confundem visualmente.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 5;
const WIDTH = 170;
const HEIGHT = 56;

type Glyph = { char: string; x: number; y: number; rotate: number };
type NoiseLine = { x1: number; y1: number; x2: number; y2: number };
type Challenge = { code: string; glyphs: Glyph[]; lines: NoiseLine[] };

function randomInt(max: number) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) % max;
}

function createChallenge(): Challenge {
  const step = WIDTH / (LENGTH + 1);
  const glyphs: Glyph[] = Array.from({ length: LENGTH }, (_, i) => ({
    char: ALPHABET.charAt(randomInt(ALPHABET.length)),
    x: step * (i + 1) + randomInt(7) - 3,
    y: HEIGHT / 2 + 9 + randomInt(9) - 4,
    rotate: randomInt(41) - 20,
  }));
  const lines: NoiseLine[] = Array.from({ length: 4 }, () => ({
    x1: randomInt(WIDTH),
    y1: randomInt(HEIGHT),
    x2: randomInt(WIDTH),
    y2: randomInt(HEIGHT),
  }));
  return { code: glyphs.map((g) => g.char).join(""), glyphs, lines };
}

export type CaptchaHandle = {
  /** Compara a resposta digitada com o código atual (ignora maiúsculas/minúsculas). */
  verify: (answer: string) => boolean;
  /** Gera um novo código. */
  refresh: () => void;
};

/**
 * Mostra a imagem do código e o botão de recarregar. O campo de texto fica no
 * formulário; quem usa o componente chama `ref.current.verify(valor)` no submit.
 *
 * O código é gerado em useEffect (depois da hidratação) para o HTML do servidor
 * não divergir do cliente, já que o TanStack Start renderiza no servidor.
 */
export const Captcha = forwardRef<CaptchaHandle, { disabled?: boolean }>(function Captcha(
  { disabled },
  ref,
) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const refresh = useCallback(() => setChallenge(createChallenge()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useImperativeHandle(
    ref,
    () => ({
      refresh,
      verify: (answer: string) =>
        challenge !== null && answer.trim().toUpperCase() === challenge.code,
    }),
    [challenge, refresh],
  );

  return (
    <div className="flex items-center gap-2">
      <div className="h-14 w-[170px] shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {challenge ? (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="size-full select-none"
            role="img"
            aria-label="Imagem com o código de verificação"
          >
            {challenge.lines.map((line, i) => (
              <line key={i} {...line} strokeWidth={1.5} className="stroke-primary/50" />
            ))}
            {challenge.glyphs.map((glyph, i) => (
              <text
                key={i}
                x={glyph.x}
                y={glyph.y}
                textAnchor="middle"
                transform={`rotate(${glyph.rotate} ${glyph.x} ${glyph.y})`}
                className="fill-foreground font-display text-2xl font-bold"
              >
                {glyph.char}
              </text>
            ))}
          </svg>
        ) : (
          <div className="size-full animate-pulse bg-muted" aria-hidden="true" />
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={refresh}
        disabled={disabled}
        aria-label="Gerar novo código"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
});
