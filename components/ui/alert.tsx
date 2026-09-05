import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Плашка — результат действия: поля 16/20, радиус 8, иконка 18 слева. */
const alertVariants = cva("flex gap-3 rounded-md border px-5 py-4 [&_svg]:mt-0.5 [&_svg]:size-4.5 [&_svg]:shrink-0", {
  variants: {
    variant: {
      success: "border-primary bg-primary-soft [&_svg]:text-primary",
      info: "border-info bg-info-soft [&_svg]:text-info",
      warning: "border-warning bg-warning-soft [&_svg]:text-warning",
      danger: "border-danger bg-danger-soft [&_svg]:text-danger",
    },
  },
  defaultVariants: { variant: "info" },
});

const titleColor = {
  success: "text-primary",
  info: "text-info-ink",
  warning: "text-warning-ink",
  danger: "text-danger-ink",
} as const;

const icons = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  danger: CircleX,
} as const;

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Кнопка следующего шага — ни одна плашка не оставляет пользователя в тупике. */
    action?: React.ReactNode;
  };

function Alert({ className, variant = "info", title, description, action, children, ...props }: AlertProps) {
  const kind = variant ?? "info";
  const Icon = icons[kind];
  return (
    <div
      data-slot="alert"
      data-variant={kind}
      role={kind === "danger" || kind === "warning" ? "alert" : "status"}
      className={cn(alertVariants({ variant: kind }), className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-body font-semibold", titleColor[kind])}>{title}</p>
        {description ? <p className="mt-0.5 text-caption text-text-muted">{description}</p> : null}
        {children}
        {action ? <div className="mt-3 flex flex-wrap gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
};

/**
 * Пустое состояние: круглая иконка 64 на primary-soft, заголовок 18 SemiBold,
 * пояснение 13 text-muted и одна-две кнопки. Пояснение говорит, зачем нужен
 * раздел и что сделать, а не констатирует пустоту.
 */
function EmptyState({ className, icon, title, description, actions, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "grid justify-items-center gap-3.5 rounded-lg border border-border bg-surface px-8 py-9 text-center",
        className,
      )}
      {...props}
    >
      <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary [&_svg]:size-6.5">
        {icon}
      </span>
      <h3 className="text-h2 font-semibold text-text">{title}</h3>
      <p className="max-w-prose text-caption text-text-muted">{description}</p>
      {actions ? <div className="mt-1 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

export { Alert, alertVariants, EmptyState };
