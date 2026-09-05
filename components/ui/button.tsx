import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Пять типов кнопок дизайн-системы. Тип выбирается по смыслу действия:
 * primary — одно главное действие на экран; secondary — «Быстрый заказ»,
 * «Повторить заказ»; info — экспорт, скачивание, печать; neutral — отмена,
 * сброс; danger — удаление, всегда с подтверждением.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-medium leading-none whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:border-border disabled:bg-neutral disabled:text-text-muted [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-surface hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "border-primary bg-surface text-primary hover:bg-primary-soft active:border-primary-active active:bg-primary-pressed active:text-primary-active",
        info: "border-info bg-surface text-info hover:bg-info-soft active:border-info-ink active:bg-info-pressed active:text-info-ink",
        neutral:
          "border-transparent bg-neutral text-text hover:bg-border active:bg-neutral-pressed",
        danger:
          "border-danger bg-surface text-danger hover:bg-danger-soft active:border-danger-ink active:bg-danger-pressed active:text-danger-ink",
      },
      size: {
        sm: "h-control-sm px-3.5 text-body [&_svg]:size-4",
        md: "h-control-md min-w-30 px-4.5 text-body [&_svg]:size-4",
        lg: "h-control-lg min-w-30 px-6 text-body [&_svg]:size-4",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

/**
 * Иконочная кнопка: 40×40 с иконкой 18, в строке таблицы — 32×32 с иконкой 16.
 * aria-label обязателен: без подписи кнопка недоступна ассистивным технологиям.
 */
const iconButtonVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-md border transition-colors select-none disabled:pointer-events-none disabled:border-border disabled:bg-neutral disabled:text-text-muted [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        outline:
          "border-border bg-surface text-text-muted hover:bg-neutral hover:text-text active:bg-neutral-pressed",
        primary:
          "border-transparent bg-primary text-surface hover:bg-primary-hover active:bg-primary-active",
        accent:
          "border-border bg-surface text-primary hover:bg-primary-soft active:bg-primary-pressed",
        info: "border-border bg-surface text-info hover:bg-info-soft active:bg-info-pressed",
        danger:
          "border-border bg-surface text-danger hover:bg-danger-soft active:bg-danger-pressed",
        ghost:
          "border-transparent bg-transparent text-text-muted hover:text-text active:bg-neutral",
      },
      size: {
        md: "size-control-md [&_svg]:size-4.5",
        sm: "size-control-sm [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

type IconButtonProps = Omit<React.ComponentProps<"button">, "aria-label"> &
  VariantProps<typeof iconButtonVariants> & {
    "aria-label": string;
    asChild?: boolean;
  };

function IconButton({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="icon-button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, IconButton, buttonVariants, iconButtonVariants };
export type { ButtonProps, IconButtonProps };
