import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Единая форма бейджа: высота 26, радиус 6, поля 10, текст 12 Medium, иконка 13.
 * Различается только цветом и наличием обводки. Обводка означает «требует
 * внимания и ещё может измениться», её отсутствие — свершившийся факт.
 */
const badgeVariants = cva(
  "inline-flex h-6.5 shrink-0 items-center gap-1 rounded-sm border px-2.5 text-small font-medium whitespace-nowrap [&_svg]:size-3.25 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* ограничения и наличие */
        limit: "border-warning bg-warning-soft text-warning-ink",
        stock: "border-transparent bg-primary-soft text-primary",
        preorder: "border-transparent bg-warning-soft text-warning-ink",
        out: "border-transparent bg-neutral text-text-muted",
        violation: "border-danger bg-danger-soft text-danger-ink",
        /* статусы заказа */
        accepted: "border-transparent bg-warning-soft text-warning-ink",
        confirmed: "border-info bg-info-soft text-info-ink",
        "in-work": "border-primary bg-primary-soft text-primary",
        done: "border-transparent bg-primary-soft text-primary",
        shipped: "border-transparent bg-info-soft text-info-ink",
        cancelled: "border-transparent bg-neutral text-text-muted",
        /* маркеры товара */
        hit: "border-primary bg-surface text-primary",
        new: "border-info bg-surface text-info",
        /* теги свойств */
        tag: "border-border bg-bg text-text-muted",
        "tag-more": "border-border bg-bg text-info",
      },
    },
    defaultVariants: {
      variant: "tag",
    },
  },
);

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

type OrderStatus = "accepted" | "confirmed" | "in-work" | "done" | "shipped" | "cancelled";

const orderStatusLabels: Record<OrderStatus, string> = {
  accepted: "Принят",
  confirmed: "Подтверждён",
  "in-work": "В работе",
  done: "Выполнен",
  shipped: "Отгружен",
  cancelled: "Отменён",
};

function OrderStatusBadge({
  status,
  className,
  ...props
}: Omit<BadgeProps, "variant" | "children"> & { status: OrderStatus }) {
  return (
    <Badge variant={status} className={className} {...props}>
      {orderStatusLabels[status]}
    </Badge>
  );
}

/** Счётчик-бейдж: круг 20, число 11 SemiBold белым. Шапка, вкладки, кнопка фильтров. */
function Counter({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="counter"
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-counter font-semibold tabular-nums text-surface",
        className,
      )}
      {...props}
    />
  );
}

/** Чип применённого фильтра: 32 px, крестик справа снимает фильтр. */
function Chip({
  className,
  children,
  onRemove,
  removeLabel,
  ...props
}: React.ComponentProps<"span"> & {
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex h-control-sm shrink-0 items-center gap-2 rounded-md border border-primary bg-primary-soft pl-3 pr-2 text-body font-medium text-primary whitespace-nowrap",
        !onRemove && "pr-3",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Снять фильтр ${String(children)}`}
          className="inline-grid size-5 place-items-center rounded-xs text-primary hover:bg-primary-pressed [&_svg]:size-3.5"
        >
          <X />
        </button>
      ) : null}
    </span>
  );
}

/** Текстовая ссылка: info, подчёркивание только при наведении и фокусе. */
function TextLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="text-link"
      className={cn(
        "inline text-body text-info hover:underline focus-visible:underline",
        className,
      )}
      {...props}
    />
  );
}

/** Та же ссылка, но кнопка: для действий без перехода («Сбросить все», «Показать ещё»). */
function TextButton({ className, type, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="text-button"
      type={type ?? "button"}
      className={cn(
        "inline text-body text-info hover:underline focus-visible:underline disabled:text-text-muted disabled:no-underline",
        className,
      )}
      {...props}
    />
  );
}

export {
  Badge,
  badgeVariants,
  OrderStatusBadge,
  orderStatusLabels,
  Counter,
  Chip,
  TextLink,
  TextButton,
};
export type { BadgeProps, OrderStatus };
