"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { CircleHelp, X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

/** Триггер «?»: иконочная кнопка 32 без рамки с circle-help 16. */
function HelpTrigger({ className, ...props }: Omit<React.ComponentProps<typeof IconButton>, "size" | "variant" | "children">) {
  return (
    <PopoverPrimitive.Trigger asChild>
      <IconButton variant="ghost" size="sm" className={cn("rounded-full", className)} {...props}>
        <CircleHelp />
      </IconButton>
    </PopoverPrimitive.Trigger>
  );
}

/** Поповер: surface, border, радиус 12, тень overlay, поля 16, ширина 320. Хвостика нет. */
function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-4 text-body text-text shadow-overlay outline-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/** Заголовок 14 SemiBold и кнопка ✕ 32 в правом верхнем углу. */
function PopoverHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="popover-header" className={cn("mb-2.5 flex items-start justify-between gap-3", className)} {...props}>
      <div className="text-body font-semibold text-text">{children}</div>
      <PopoverPrimitive.Close asChild>
        <IconButton variant="ghost" size="sm" aria-label="Закрыть" className="-mt-1 -mr-1">
          <X />
        </IconButton>
      </PopoverPrimitive.Close>
    </div>
  );
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="popover-description" className={cn("mt-3 text-caption text-text-muted", className)} {...props} />;
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent, PopoverHeader, PopoverDescription, HelpTrigger };
