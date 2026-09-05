import * as React from "react";
import { cn } from "@/lib/utils";

function Section({
  id,
  num,
  title,
  description,
  children,
}: {
  id: string;
  num: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-border py-10 first:border-t-0">
      <div className="mb-6 max-w-prose">
        <p className="font-mono text-small text-text-muted">{num}</p>
        <h2 className="mt-1 text-h2 font-semibold text-text">{title}</h2>
        {description ? <p className="mt-2 text-body text-text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-lg border border-border bg-surface p-6", className)}>
      {title ? <p className="mb-4 text-small font-medium text-text-muted">{title}</p> : null}
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-prose text-caption text-text-muted">{children}</p>;
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}

export { Section, Card, Note, Row };
