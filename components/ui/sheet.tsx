"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn("fixed inset-0 z-50 bg-overlay", className)} {...props} />
  );
}

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "right" | "left" | "bottom";
};

/**
 * Шторка: справа, 360 px на планшете и во всю ширину до 767 px; surface, тень overlay.
 * Шапка 56 px, содержимое прокручивается внутри, подвал прижат к низу.
 */
function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-surface text-body text-text shadow-overlay outline-none",
          side === "right" && "inset-y-0 right-0 h-full w-full sm:max-w-90",
          side === "left" && "inset-y-0 left-0 h-full w-full sm:max-w-90",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[calc(100vh-3rem)] rounded-t-lg",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

/** Шапка 56 px: заголовок 16 Medium, при необходимости счётчик, ✕ 40 справа. */
function SheetHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex h-14 shrink-0 items-center gap-2.5 border-b border-border pr-4 pl-4 sm:pl-6", className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close asChild>
        <IconButton variant="ghost" aria-label="Закрыть" className="ml-auto">
          <X />
        </IconButton>
      </SheetPrimitive.Close>
    </div>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-h3 font-medium text-text", className)} {...props} />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description data-slot="sheet-description" className={cn("sr-only", className)} {...props} />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("flex-1 overflow-y-auto px-4 sm:px-6", className)} {...props} />;
}

/** Подвал: линия сверху, поля 16, главное действие 48 px на всю ширину. */
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-footer" className={cn("flex shrink-0 gap-3 border-t border-border p-4", className)} {...props} />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetOverlay, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter };
