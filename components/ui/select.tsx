"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * Триггер — обычное поле 40 px (или компактное 32) с шевроном справа;
 * в открытом состоянии обводка primary и перевёрнутый шеврон.
 */
function SelectTrigger({
  className,
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "md" | "sm" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-2.5 border border-border bg-surface text-body text-text whitespace-nowrap outline-none transition-colors select-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:bg-neutral disabled:text-text-muted data-[placeholder]:text-text-muted data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary aria-invalid:border-danger *:data-[slot=select-value]:truncate [&_svg]:shrink-0 [&_svg]:text-text-muted data-[state=open]:[&_svg]:rotate-180",
        size === "md" ? "h-control-md rounded-md px-3.5 [&_svg]:size-4" : "h-control-sm rounded-sm px-2.5 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Панель: surface, обводка border, радиус 8, тень overlay; выше 8 пунктов — прокрутка. */
function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-64 min-w-(--radix-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-surface p-1 text-text shadow-overlay",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="w-full">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2.5 py-1.5 text-small font-medium text-text-muted", className)}
      {...props}
    />
  );
}

/** Пункт 32 px: наведение — neutral, выбранный — primary-soft с галкой справа. */
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-control-sm w-full cursor-pointer items-center rounded-sm pl-2.5 pr-8 text-body text-text outline-none select-none focus:bg-neutral data-[state=checked]:bg-primary-soft data-[state=checked]:text-primary data-[disabled]:pointer-events-none data-[disabled]:text-text-muted",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="pointer-events-none absolute right-2.5 grid size-4 place-items-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center bg-surface py-1 text-text-muted [&_svg]:size-4", className)}
      {...props}
    >
      <ChevronUp />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center bg-surface py-1 text-text-muted [&_svg]:size-4", className)}
      {...props}
    >
      <ChevronDown />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
