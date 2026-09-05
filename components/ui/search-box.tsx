"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBoxProps = Omit<React.ComponentProps<"input">, "type" | "size"> & {
  /** Сочетание Ctrl + / переводит фокус в это поле с любого места страницы. */
  hotkey?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
};

/**
 * Поиск по коду 1С, названию или штрихкоду: 44 px, поле и зелёная кнопка 56 px
 * в одном контейнере с радиусом 8. Подсказка сочетания клавиш — моноширинным
 * 11 px справа, на телефоне скрыта.
 */
function SearchBox({ hotkey = true, onSearch, className, placeholder, ...props }: SearchBoxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  return (
    <form
      role="search"
      data-slot="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.(ref.current?.value ?? "");
      }}
      className={cn(
        "flex h-11 w-full items-stretch overflow-hidden rounded-md border border-border bg-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        className,
      )}
    >
      <div className="relative flex min-w-0 flex-1 items-center">
        <input
          ref={ref}
          type="search"
          placeholder={placeholder ?? "Поиск по коду 1С, названию или штрихкоду"}
          aria-label={placeholder ?? "Поиск по коду 1С, названию или штрихкоду"}
          className="h-full w-full min-w-0 bg-transparent pl-4 pr-3 text-body text-text outline-none placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {hotkey ? (
          <kbd
            aria-hidden="true"
            className="pointer-events-none mr-3 hidden shrink-0 font-mono text-counter text-text-muted sm:inline"
          >
            Ctrl + /
          </kbd>
        ) : null}
      </div>
      <button
        type="submit"
        aria-label="Найти"
        className="grid w-14 shrink-0 place-items-center bg-primary text-surface hover:bg-primary-hover active:bg-primary-active [&_svg]:size-4.5"
      >
        <Search />
      </button>
    </form>
  );
}

export { SearchBox };
