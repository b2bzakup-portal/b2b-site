"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

/** Та же панель, что у выпадающего списка: surface, border, радиус 8, тень overlay. */
function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 max-h-64 min-w-(--radix-dropdown-menu-trigger-width) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-surface p-1 text-text shadow-overlay",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

/** Пункт меню 32 px; опасный пункт («Удалить») — красным. */
function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: "default" | "danger" }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        "flex h-control-sm cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-body text-text outline-none select-none focus:bg-neutral data-[disabled]:pointer-events-none data-[disabled]:text-text-muted data-[variant=danger]:text-danger data-[variant=danger]:focus:bg-danger-soft [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-muted data-[variant=danger]:[&_svg]:text-danger",
        className,
      )}
      {...props}
    />
  );
}

/** Пункт с чекбоксом 18 — Excel-фильтр по значениям колонки. */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "group/item flex h-control-sm cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-body text-text outline-none select-none focus:bg-neutral data-[disabled]:pointer-events-none data-[disabled]:text-text-muted",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid size-4.5 shrink-0 place-items-center rounded-xs border border-border bg-surface text-surface group-data-[state=checked]/item:border-primary group-data-[state=checked]/item:bg-primary [&_svg]:size-3 [&_svg]:stroke-[2.5]"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-2.5 py-1.5 text-small font-medium text-text-muted", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

/** Подвал Excel-фильтра: «Применить» и «Сбросить». */
function DropdownMenuFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-footer"
      className={cn("mt-1 flex items-center justify-between gap-3 border-t border-border px-1.5 pt-2 pb-1", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuFooter,
};
