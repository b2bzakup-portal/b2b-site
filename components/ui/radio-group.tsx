"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
  );
}

/** Точка радио 18×18; выбранная — кольцо primary 5 px. */
function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer size-4.5 shrink-0 rounded-full border border-border bg-surface transition-colors disabled:cursor-not-allowed disabled:bg-neutral data-[state=checked]:border-5 data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    />
  );
}

type RadioCardProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
};

/**
 * Радио-карточка — способ получения заказа: заголовок 14 Medium, пояснение 12
 * text-muted, выбранная — обводка primary 2 px.
 */
function RadioCard({ id, title, description, className, disabled, ...props }: RadioCardProps) {
  return (
    <label
      htmlFor={id}
      data-slot="radio-card"
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-neutral",
        className,
      )}
    >
      <RadioGroupItem id={id} disabled={disabled} {...props} />
      <span className="min-w-0">
        <span className={cn("block text-body font-medium text-text", disabled && "text-text-muted")}>{title}</span>
        {description ? <span className="block text-small text-text-muted">{description}</span> : null}
      </span>
    </label>
  );
}

export { RadioGroup, RadioGroupItem, RadioCard };
