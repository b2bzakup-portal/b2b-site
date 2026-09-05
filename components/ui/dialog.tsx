"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/** Подложка — токен overlay на всё окно браузера. */
function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-overlay", className)}
      {...props}
    />
  );
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** 480 px — подтверждения и короткие формы; 960 px — двухколоночное окно с промо-колонкой. */
  size?: "sm" | "lg";
  showCloseButton?: boolean;
};

/**
 * Модальное окно: surface, border, радиус 12, поля 24, ✕ 40 в углу.
 * До 767 px становится шторкой снизу во всю ширину со скруглением сверху.
 */
function DialogContent({ className, children, size = "sm", showCloseButton = true, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          "fixed z-50 flex flex-col bg-surface text-body text-text outline-none",
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[calc(100vh-3rem)] max-sm:rounded-t-lg max-sm:border-t max-sm:border-border max-sm:p-4 max-sm:pt-6",
          "sm:top-1/2 sm:left-1/2 sm:w-[calc(100%-3rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-border sm:p-6",
          size === "sm" ? "sm:max-w-120" : "sm:max-w-240",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <IconButton variant="ghost" aria-label="Закрыть" className="absolute top-4 right-4 max-sm:top-2 max-sm:right-2">
              <X />
            </IconButton>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-3 pr-12", className)} {...props} />;
}

/** Заголовок окна — H2 20 SemiBold. */
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-h2 font-semibold text-text", className)} {...props} />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-body text-text-muted", className)}
      {...props}
    />
  );
}

/** Кнопки справа с промежутком 12, основное действие последним; на телефоне — в столбик. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export { Dialog, DialogTrigger, DialogClose, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
