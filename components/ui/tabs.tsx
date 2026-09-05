"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex min-w-0 flex-col", className)} {...props} />;
}

/** Ряд вкладок на линии border, промежуток 24; на узком экране прокручивается. */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex w-full min-w-0 gap-6 overflow-x-auto border-b border-border", className)}
      {...props}
    />
  );
}

/** Вкладка 40 px, 14 Medium; активная — text с подчёркиванием primary 2 px. */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "-mb-px inline-flex h-control-md shrink-0 items-center gap-2 border-b-2 border-transparent text-body font-medium text-text-muted whitespace-nowrap transition-colors hover:text-text focus-visible:outline-offset-[-2px] data-[state=active]:border-primary data-[state=active]:text-text [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("pt-6 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
