import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, CircleAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 border border-border bg-surface text-body text-text outline-none transition-colors placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:bg-neutral disabled:text-text-muted aria-invalid:border-danger aria-invalid:focus-visible:ring-danger data-[state=success]:border-primary",
  {
    variants: {
      size: {
        md: "h-control-md rounded-md px-3.5",
        sm: "h-control-sm rounded-sm px-2.5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type InputProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

function Input({ className, size, type, ...props }: InputProps) {
  return (
    <input
      type={type ?? "text"}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

type FieldState = "default" | "error" | "success";

type FieldProps = {
  id: string;
  label?: string;
  /** Подпись под полем: при ошибке — что исправить, при успехе — что подтвердилось. */
  hint?: string;
  state?: FieldState;
  disabled?: boolean;
  /** Иконка слева, например поиск в компактном поле. */
  leadingIcon?: React.ReactNode;
  size?: "md" | "sm";
  className?: string;
  children?: never;
} & Omit<InputProps, "id" | "size" | "className" | "children">;

/**
 * Поле с меткой и подписью. Метка 12 px Medium над полем, подпись 12 px под ним.
 * Ошибка — красная обводка, иконка circle-alert и подпись danger-ink; успех —
 * зелёная обводка, галка и подпись primary; отключено — серая заливка и замок.
 * label и текст подписи связаны с полем через htmlFor и aria-describedby.
 */
function Field({
  id,
  label,
  hint,
  state = "default",
  disabled,
  leadingIcon,
  size = "md",
  className,
  ...inputProps
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const trailing = disabled ? (
    <Lock />
  ) : state === "error" ? (
    <CircleAlert className="text-danger" />
  ) : state === "success" ? (
    <Check className="text-primary" />
  ) : null;

  return (
    <div data-slot="field" data-state={state} className={cn("block", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-small font-medium text-text-muted">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-2.5 grid place-items-center text-text-muted [&_svg]:size-4">
            {leadingIcon}
          </span>
        ) : null}
        <Input
          id={id}
          size={size}
          disabled={disabled}
          aria-invalid={state === "error" || undefined}
          aria-describedby={hintId}
          data-state={state === "success" ? "success" : undefined}
          className={cn(leadingIcon && "pl-8.5", trailing && "pr-10")}
          {...inputProps}
        />
        {trailing ? (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center text-text-muted [&_svg]:size-4">
            {trailing}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p
          id={hintId}
          role={state === "error" ? "alert" : undefined}
          className={cn(
            "mt-1.5 text-small",
            state === "error" ? "text-danger-ink" : state === "success" ? "text-primary" : "text-text-muted",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Input, Field, inputVariants };
export type { InputProps, FieldProps, FieldState };
