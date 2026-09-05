"use client";

import * as React from "react";
import { ChevronDown, ShoppingCart, Star } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Stepper, isQuantityValid } from "@/components/ui/stepper";
import { Alert } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, stickyEnd, stickyStart } from "@/components/ui/table";

const rub = new Intl.NumberFormat("ru-RU");

type Row = {
  name: string;
  type: string;
  code: string;
  stock: { variant: "stock" | "preorder" | "out"; text: string };
  price: number;
  unit: string;
  step: number;
  min: number;
  qty: number;
  disabled?: boolean;
};

const initialRows: Row[] = [
  {
    name: "Комбикорм для бройлеров ПК-5, гранулы",
    type: "Комбикорм · Бройлеры",
    code: "00-00012345",
    stock: { variant: "stock", text: "В наличии: 350 кг" },
    price: 1240,
    unit: "кг",
    step: 25,
    min: 50,
    qty: 50,
  },
  {
    name: "Премикс для несушек П1-2, 25 кг",
    type: "Премикс · Куры-несушки",
    code: "00-00012418",
    stock: { variant: "preorder", text: "Под заказ · от 2 дней" },
    price: 3890,
    unit: "шт.",
    step: 1,
    min: 4,
    qty: 4,
  },
  {
    name: "Кормовая добавка «Витамикс», 10 кг",
    type: "Кормовая добавка · КРС",
    code: "00-00012502",
    stock: { variant: "stock", text: "В наличии: 42 шт." },
    price: 2150,
    unit: "шт.",
    step: 2,
    min: 10,
    qty: 6,
  },
  {
    name: "Зерносмесь для кроликов, 20 кг",
    type: "Зерносмесь · Кролики",
    code: "00-00012587",
    stock: { variant: "out", text: "Нет в наличии" },
    price: 980,
    unit: "шт.",
    step: 1,
    min: 5,
    qty: 0,
    disabled: true,
  },
];

function CatalogTableDemo() {
  const [rows, setRows] = React.useState(initialRows);
  const [compact, setCompact] = React.useState(false);
  const setQty = (code: string, qty: number) => setRows((rs) => rs.map((r) => (r.code === code ? { ...r, qty } : r)));
  const violations = rows.filter((r) => !r.disabled && !isQuantityValid(r.qty, r.min, r.step));

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2.5">
        <Checkbox id="table-compact" checked={compact} onCheckedChange={(c) => setCompact(c === true)} />
        <label htmlFor="table-compact" className="text-body text-text select-none">
          Компактный режим, строка 48 px
        </label>
      </div>
      <Table density={compact ? "compact" : "default"} containerClassName="max-h-120 overflow-y-auto">
        <TableHeader>
          <TableRow className="bg-bg">
            <TableHead className="w-11 pr-0">
              <Checkbox aria-label="Выбрать все" />
            </TableHead>
            <TableHead className={`min-w-72 ${stickyStart} bg-bg`}>Наименование товара</TableHead>
            <TableHead className="w-37.5">
              <span className="inline-flex items-center gap-1">
                Код 1С <ChevronDown className="size-3.5 text-text-muted" aria-hidden="true" />
              </span>
            </TableHead>
            <TableHead className="w-30">
              <span className="inline-flex items-center gap-1">
                Наличие <ChevronDown className="size-3.5 text-text-muted" aria-hidden="true" />
              </span>
            </TableHead>
            <TableHead className="w-27.5 text-right">Цена B2B, ₽</TableHead>
            <TableHead className="w-25 text-right">Кратность</TableHead>
            <TableHead className="w-27.5 text-right">МЗП</TableHead>
            <TableHead className="w-37.5">Количество</TableHead>
            <TableHead className={`w-22.5 ${stickyEnd} bg-bg`}>
              <span className="sr-only">Действия</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const invalid = !r.disabled && !isQuantityValid(r.qty, r.min, r.step);
            return (
              <TableRow key={r.code} state={invalid ? "error" : "default"} className="bg-surface data-[state=error]:bg-danger-row">
                <TableCell className="pr-0">
                  <Checkbox aria-label={`Выбрать ${r.name}`} disabled={r.disabled} />
                </TableCell>
                <TableCell className={`${stickyStart} whitespace-normal`}>
                  <div className="flex items-center gap-3">
                    <span className="size-10 shrink-0 rounded-sm bg-neutral" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-body font-medium text-text">{r.name}</p>
                      <p className="text-small text-text-muted">{r.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="code-1c">{r.code}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={r.stock.variant}>{r.stock.text}</Badge>
                </TableCell>
                <TableCell className="cell-numeric">
                  <span className="text-price font-semibold text-text">{rub.format(r.price)}</span>
                  <span className="block text-small text-text-muted">
                    от {r.min} {r.unit}
                  </span>
                </TableCell>
                <TableCell className="cell-numeric">
                  {r.step} {r.unit}
                </TableCell>
                <TableCell className="cell-numeric">
                  {r.min} {r.unit}
                </TableCell>
                <TableCell>
                  <Stepper
                    value={r.qty}
                    onChange={(v) => setQty(r.code, v)}
                    min={r.min}
                    step={r.step}
                    disabled={r.disabled}
                    aria-label={`Количество, ${r.name}`}
                  />
                </TableCell>
                <TableCell className={stickyEnd}>
                  <div className="flex justify-end gap-2">
                    <IconButton aria-label="В корзину" variant="primary" size="sm" disabled={r.disabled || invalid}>
                      <ShoppingCart />
                    </IconButton>
                    <IconButton aria-label="В избранное" size="sm">
                      <Star />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {violations.map((r) => (
        <Alert
          key={r.code}
          variant="danger"
          title="Нельзя заказать меньше МЗП"
          description={`${r.name}: минимальная партия ${r.min} ${r.unit}, кратность ${r.step} ${r.unit}. Укажите ${Math.max(r.min, Math.ceil(r.qty / r.step) * r.step)} ${r.unit} или больше.`}
        />
      ))}
    </div>
  );
}

export { CatalogTableDemo };
