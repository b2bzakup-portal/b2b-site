import * as React from "react";
import { cn } from "@/lib/utils";

type TableProps = React.ComponentProps<"table"> & {
  /** Компактный режим — строка 48 px вместо 64; пользовательская настройка. */
  density?: "default" | "compact";
  /** Обёртка с прокруткой внутри: таблица не расширяет контейнер. */
  containerClassName?: string;
};

/**
 * Таблица каталога: строка 64 px, шапка 48 px с заливкой bg, числа вправо,
 * коды моноширинным. Широкая таблица прокручивается внутри себя, колонки
 * товара и действий закрепляются по краям классами sticky-start / sticky-end.
 */
function Table({ className, density = "default", containerClassName, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto rounded-lg border border-border bg-surface", containerClassName)}
    >
      <table
        data-slot="table"
        data-density={density}
        className={cn("group/table w-full caption-bottom border-collapse text-body", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("sticky top-0 z-10 bg-bg", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot data-slot="table-footer" className={cn("border-t border-border bg-bg font-medium", className)} {...props} />
  );
}

type TableRowProps = React.ComponentProps<"tr"> & {
  /** Строка с нарушением МЗП или кратности красится в danger-row. */
  state?: "default" | "error" | "selected";
};

function TableRow({ className, state = "default", ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-state={state}
      className={cn(
        "h-row border-b border-border transition-colors group-data-[density=compact]/table:h-row-compact data-[state=error]:bg-danger-row data-[state=selected]:bg-primary-soft",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-5 text-left align-middle text-body font-medium text-text whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-5 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

/** Закреплённые по краям колонки при горизонтальной прокрутке. */
const stickyStart = "sticky left-0 z-[1] bg-inherit shadow-[inset_-1px_0_0_var(--color-border)]";
const stickyEnd = "sticky right-0 z-[1] bg-inherit shadow-[inset_1px_0_0_var(--color-border)]";

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-4 text-small text-text-muted", className)} {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, stickyStart, stickyEnd };
