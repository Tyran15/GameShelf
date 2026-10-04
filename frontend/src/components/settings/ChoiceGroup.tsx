import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  preview?: ReactNode;
}

/** Grupo de opções em cards, baseado em radios nativos (teclado e leitor de tela de graça). */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  className,
}: {
  name: string;
  legend: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className={cn("grid gap-3", className)}>
        {options.map((option) => (
          <label
            key={option.value}
            className="group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.preview}
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{option.label}</span>
              <Check className="size-4 text-primary opacity-0 group-has-checked:opacity-100" />
            </span>
            {option.description ? (
              <span className="-mt-1 text-xs text-muted-foreground">{option.description}</span>
            ) : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
