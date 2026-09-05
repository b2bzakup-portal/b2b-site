"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/input";
import { TextButton } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FacetOption = {
  value: string;
  label: string;
  count: number;
};

type FacetProps = {
  id: string;
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Поле поиска по значениям над списком — для длинных фасетов вроде «Производитель». */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Сколько значений видно до «Показать ещё (N)». */
  visible?: number;
  className?: string;
};

/**
 * Фасет фильтра: чекбоксы со счётчиками. Строка 32 px, счётчик в скобках
 * сразу за подписью; значение без товаров остаётся в списке серым и
 * недоступным. Видно шесть значений, остальные — по ссылке «Показать ещё».
 */
function Facet({
  id,
  options,
  selected,
  onChange,
  searchable,
  searchPlaceholder = "Найти значение",
  visible = 6,
  className,
}: FacetProps) {
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const shown = expanded || query ? filtered : filtered.slice(0, visible);
  const hidden = filtered.length - shown.length;

  const toggle = (value: string, checked: boolean) => {
    onChange(checked ? [...selected, value] : selected.filter((v) => v !== value));
  };

  return (
    <div data-slot="facet" className={cn("grid", className)}>
      {searchable ? (
        <Field
          id={`${id}-search`}
          size="sm"
          leadingIcon={<Search />}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
      ) : null}
      {shown.map((o) => {
        const optionId = `${id}-${o.value}`;
        const empty = o.count === 0;
        return (
          <div key={o.value} className="flex h-control-sm items-center gap-2.5">
            <Checkbox
              id={optionId}
              checked={selected.includes(o.value)}
              disabled={empty}
              onCheckedChange={(c) => toggle(o.value, c === true)}
            />
            <label
              htmlFor={optionId}
              className={cn("min-w-0 truncate text-body text-text select-none", empty && "text-text-muted")}
            >
              {o.label} <span className="text-small text-text-muted">({o.count})</span>
            </label>
          </div>
        );
      })}
      {shown.length === 0 ? <p className="py-2 text-small text-text-muted">Ничего не найдено</p> : null}
      {hidden > 0 ? (
        <TextButton className="mt-2 justify-self-start" onClick={() => setExpanded(true)}>
          Показать ещё ({hidden})
        </TextButton>
      ) : expanded && !query && options.length > visible ? (
        <TextButton className="mt-2 justify-self-start" onClick={() => setExpanded(false)}>
          Свернуть
        </TextButton>
      ) : null}
    </div>
  );
}

export { Facet };
export type { FacetOption, FacetProps };
