"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ближайшее сверху количество, кратное упаковке. */
function roundUpToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.ceil(value / step - 1e-9) * step;
}

/** Количество допустимо, когда оно не меньше минимальной партии и кратно упаковке. */
function isQuantityValid(value: number, min: number, step: number): boolean {
  if (!Number.isFinite(value) || value <= 0) return false;
  if (value < min) return false;
  if (step > 0 && Math.abs(value / step - Math.round(value / step)) > 1e-9) return false;
  return true;
}

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** Минимальная партия (МЗП). Стартовое значение и нижняя граница «−». */
  min: number;
  /** Кратность упаковки — шаг кнопок и округления при ручном вводе. */
  step: number;
  disabled?: boolean;
  /** Подпись, что именно считаем: «количество, кг». */
  "aria-label": string;
  id?: string;
  className?: string;
  /** Внешняя пометка ошибки, если проверка идёт выше (например, по остатку). */
  invalid?: boolean;
  "aria-describedby"?: string;
};

/**
 * Степпер количества — единственный способ менять количество в прототипе.
 * 32 px высотой, кнопки по 30, поле 46. Кнопки ходят с шагом кратности и не
 * опускаются ниже МЗП; ручной ввод округляется вверх до кратности при потере
 * фокуса. Значение меньше МЗП остаётся видимым и подсвечивается как нарушение —
 * так пользователь видит, что именно исправить.
 */
function Stepper({
  value,
  onChange,
  min,
  step,
  disabled,
  id,
  className,
  invalid,
  ...aria
}: StepperProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const shown = draft ?? String(value);
  const violated = invalid || !isQuantityValid(value, min, step);
  const safeStep = step > 0 ? step : 1;

  const commit = (raw: string) => {
    setDraft(null);
    const parsed = Number(raw.replace(",", ".").trim());
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const rounded = roundUpToStep(parsed, safeStep);
    if (rounded !== value) onChange(rounded);
  };

  return (
    <div
      data-slot="stepper"
      data-state={disabled ? "disabled" : violated ? "invalid" : "valid"}
      className={cn(
        "inline-flex h-control-sm shrink-0 items-stretch overflow-hidden rounded-md border border-border bg-surface focus-within:border-primary",
        violated && !disabled && "border-danger focus-within:border-danger",
        disabled && "bg-neutral",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Меньше"
        disabled={disabled || value - safeStep < min}
        onClick={() => onChange(Math.max(min, value - safeStep))}
        className="grid w-7.5 place-items-center text-text-muted hover:bg-neutral disabled:pointer-events-none disabled:text-border [&_svg]:size-3.5"
      >
        <Minus />
      </button>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={shown}
        disabled={disabled}
        aria-invalid={violated || undefined}
        aria-label={aria["aria-label"]}
        aria-describedby={aria["aria-describedby"]}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
        }}
        className={cn(
          "w-11.5 border-x border-border bg-transparent text-center text-body font-medium tabular-nums text-text outline-none disabled:text-text-muted",
          violated && !disabled && "text-danger-ink",
        )}
      />
      <button
        type="button"
        aria-label="Больше"
        disabled={disabled}
        onClick={() => onChange(roundUpToStep(Math.max(min, value + safeStep), safeStep))}
        className="grid w-7.5 place-items-center text-primary hover:bg-neutral disabled:pointer-events-none disabled:text-text-muted [&_svg]:size-3.5"
      >
        <Plus />
      </button>
    </div>
  );
}

export { Stepper, roundUpToStep, isQuantityValid };
export type { StepperProps };
