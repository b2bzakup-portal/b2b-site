"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Трек 4 px border, активный отрезок primary, ручки — круг 18 primary. */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabels,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { thumbLabels?: string[] }) {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center py-2 select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="relative h-1 w-full grow rounded-full bg-border">
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          aria-label={thumbLabels?.[index]}
          className="block size-4.5 shrink-0 rounded-full bg-primary transition-colors hover:bg-primary-hover active:bg-primary-active disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

const rub = new Intl.NumberFormat("ru-RU");

type PriceRangeProps = {
  id: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
};

/**
 * Диапазон цены: поля «от / до» 40 px и двухсторонний слайдер под ними.
 * Поля и ручки связаны: ввод в поле двигает ручку, ручка переписывает поле.
 * Под концами трека — минимальная и максимальная цена текущей выборки.
 */
function PriceRange({ id, min, max, value, onChange, step = 1, className }: PriceRangeProps) {
  const [from, to] = value;
  const [draft, setDraft] = React.useState<[string, string] | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = (index: 0 | 1, raw: string) => {
    setDraft(null);
    const parsed = Number(raw.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    const next: [number, number] = [from, to];
    next[index] = clamp(parsed);
    if (next[0] > next[1]) {
      if (index === 0) next[1] = next[0];
      else next[0] = next[1];
    }
    onChange(next);
  };

  const shown = draft ?? [rub.format(from), rub.format(to)];

  return (
    <div data-slot="price-range" className={cn("grid gap-1", className)}>
      <div className="flex gap-3">
        {(["от", "до"] as const).map((label, i) => {
          const index = i as 0 | 1;
          const inputId = `${id}-${index === 0 ? "from" : "to"}`;
          return (
            <div key={label} className="min-w-0 flex-1">
              <label htmlFor={inputId} className="mb-1.5 block text-small font-medium text-text-muted">
                {label}
              </label>
              <Input
                id={inputId}
                inputMode="numeric"
                value={shown[index]}
                onChange={(e) => {
                  const next: [string, string] = [shown[0], shown[1]];
                  next[index] = e.target.value;
                  setDraft(next);
                }}
                onBlur={(e) => commit(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit(index, e.currentTarget.value);
                }}
              />
            </div>
          );
        })}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[from, to]}
        minStepsBetweenThumbs={0}
        thumbLabels={["Цена от", "Цена до"]}
        onValueChange={(v) => onChange([v[0], v[1]])}
        className="mt-2"
      />
      <div className="flex justify-between text-small text-text-muted">
        <span>{rub.format(min)} ₽</span>
        <span>{rub.format(max)} ₽</span>
      </div>
    </div>
  );
}

export { Slider, PriceRange };
