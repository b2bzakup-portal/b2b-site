"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Чекбокс 18×18, радиус 4; отмеченный — заливка primary с белой галкой. */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer grid size-4.5 shrink-0 place-items-center rounded-xs border border-border bg-surface text-surface transition-colors disabled:cursor-not-allowed disabled:bg-neutral data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary disabled:data-[state=checked]:border-border disabled:data-[state=checked]:bg-text-muted",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-items-center [&_svg]:size-3 [&_svg]:stroke-[2.5]">
        <Check />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

type CheckboxFieldProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
};

/** Чекбокс с подписью справа: согласия, множественный выбор строк. */
function CheckboxField({ id, label, description, className, disabled, ...props }: CheckboxFieldProps) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <Checkbox id={id} disabled={disabled} className="mt-0.5" {...props} />
      <label
        htmlFor={id}
        className={cn("text-body text-text select-none", disabled && "text-text-muted")}
      >
        {label}
        {description ? <span className="mt-0.5 block text-small text-text-muted">{description}</span> : null}
      </label>
    </div>
  );
}

export { Checkbox, CheckboxField };
