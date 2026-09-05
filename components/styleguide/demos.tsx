"use client";

import * as React from "react";
import { CircleHelp, Filter, Funnel, Paperclip, Phone, ShoppingCart } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Chip, Counter, TextButton } from "@/components/ui/badge";
import { Stepper, isQuantityValid } from "@/components/ui/stepper";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/input";
import { CheckboxField } from "@/components/ui/checkbox";
import { RadioGroup, RadioCard } from "@/components/ui/radio-group";
import { SearchBox } from "@/components/ui/search-box";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Facet, type FacetOption } from "@/components/ui/facet";
import { PriceRange } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpTrigger, Popover, PopoverContent, PopoverDescription, PopoverHeader } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const rub = new Intl.NumberFormat("ru-RU");

/* ---------------------------------------------------------------- Степпер */

function StepperDemo() {
  const [qty, setQty] = React.useState(10);
  const [bad, setBad] = React.useState(5);
  const min = 10;
  const step = 5;
  const badValid = isQuantityValid(bad, min, step);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Stepper value={qty} onChange={setQty} min={min} step={step} aria-label="Количество, кг" />
          <span className="text-caption text-text-muted">кг · МЗП {min}, кратность {step}</span>
        </div>
        <div className="flex items-center gap-2">
          <Stepper value={bad} onChange={setBad} min={min} step={step} aria-label="Количество, кг" aria-describedby="stepper-violation" />
          <span className="text-caption text-text-muted">кг · нарушение</span>
        </div>
        <div className="flex items-center gap-2">
          <Stepper value={0} onChange={() => undefined} min={min} step={step} disabled aria-label="Количество, кг" />
          <span className="text-caption text-text-muted">нет в наличии</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={!badValid}>
          <ShoppingCart /> В корзину
        </Button>
        <span className="text-caption text-text-muted">кнопка гаснет, пока количество нарушает МЗП или кратность</span>
      </div>
      {!badValid ? (
        <Alert
          id="stepper-violation"
          variant="danger"
          title="Нельзя заказать меньше МЗП"
          description={`Комбикорм для бройлеров ПК-5: минимальная партия ${min} кг, кратность ${step} кг. Укажите ${Math.max(min, Math.ceil(bad / step) * step)} кг или больше.`}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Формы */

function ChoiceDemo() {
  const [delivery, setDelivery] = React.useState("delivery");
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <CheckboxField id="agree-terms" label="Я принимаю пользовательское соглашение" defaultChecked />
        <CheckboxField id="agree-personal" label="Согласие на обработку персональных данных" />
        <CheckboxField id="agree-disabled" label="Отключённый выбор" disabled />
      </div>
      <RadioGroup value={delivery} onValueChange={setDelivery} className="grid gap-3 sm:grid-cols-2">
        <RadioCard id="pickup" value="pickup" title="Самовывоз" description="141730, Московская обл., г. Лобня, ул. Спортивная, 4а" />
        <RadioCard id="delivery" value="delivery" title="Доставка" description="Транспортной компанией" />
      </RadioGroup>
    </div>
  );
}

function SearchDemo() {
  const [last, setLast] = React.useState<string | null>(null);
  return (
    <div className="grid gap-3">
      <SearchBox onSearch={setLast} />
      <p className="text-caption text-text-muted">
        {last === null ? "Ctrl + / переводит фокус в поле с любого места страницы." : last ? `Запрос: «${last}»` : "Пустой запрос."}
      </p>
    </div>
  );
}

const producers: FacetOption[] = [
  { value: "biopro", label: "БиоПро", count: 12 },
  { value: "kormstandart", label: "Кормовой стандарт", count: 9 },
  { value: "polesie", label: "Полесье-Агро", count: 7 },
  { value: "zernovik", label: "Зерновик", count: 5 },
  { value: "agrovita", label: "АгроВита", count: 4 },
  { value: "rosfeed", label: "РосКорм", count: 3 },
  { value: "mixline", label: "МиксЛайн", count: 2 },
  { value: "severny", label: "Северный корм", count: 0 },
];

function SelectDemo() {
  const [perPage, setPerPage] = React.useState("10");
  const [producer, setProducer] = React.useState<string | undefined>();
  return (
    <div className="grid gap-4">
      <div>
        <label htmlFor="per-page" className="mb-1.5 block text-small font-medium text-text-muted">
          Показать по
        </label>
        <Select value={perPage} onValueChange={setPerPage}>
          <SelectTrigger id="per-page" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["10", "25", "50", "100"].map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="producer" className="mb-1.5 block text-small font-medium text-text-muted">
          Производитель
        </label>
        <Select value={producer} onValueChange={setProducer}>
          <SelectTrigger id="producer">
            <SelectValue placeholder="Все производители" />
          </SelectTrigger>
          <SelectContent>
            {producers.map((p) => (
              <SelectItem key={p.value} value={p.value} disabled={p.count === 0}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="producer-sm" className="mb-1.5 block text-small font-medium text-text-muted">
          Компактный, 32 px
        </label>
        <Select defaultValue="popular">
          <SelectTrigger id="producer-sm" size="sm" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">По популярности</SelectItem>
            <SelectItem value="price-asc">Сначала дешевле</SelectItem>
            <SelectItem value="price-desc">Сначала дороже</SelectItem>
            <SelectItem value="name">По названию</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ExcelFilterDemo() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({ stock: true, order: true, out: false });
  const options = [
    { key: "stock", label: "В наличии", count: 64 },
    { key: "order", label: "Под заказ", count: 8 },
    { key: "out", label: "Нет в наличии", count: 4 },
  ];
  return (
    <div className="grid gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="neutral" size="sm">
            <Funnel /> Наличие
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          {options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.key}
              checked={checked[o.key]}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(c) => setChecked((s) => ({ ...s, [o.key]: c === true }))}
            >
              {o.label} <span className="text-small text-text-muted">({o.count})</span>
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuFooter>
            <Button size="sm">Применить</Button>
            <TextButton onClick={() => setChecked({ stock: false, order: false, out: false })}>Сбросить</TextButton>
          </DropdownMenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="neutral" size="sm">
            Действия
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>Повторить заказ</DropdownMenuItem>
          <DropdownMenuItem>Скачать счёт</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">Отменить заказ</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function FacetDemo() {
  const [selected, setSelected] = React.useState<string[]>(["biopro"]);
  return <Facet id="producer-facet" options={producers} selected={selected} onChange={setSelected} searchable searchPlaceholder="Найти производителя" />;
}

function PriceRangeDemo() {
  const [range, setRange] = React.useState<[number, number]>([1200, 18500]);
  return <PriceRange id="price" min={450} max={24000} step={50} value={range} onChange={setRange} />;
}

function ChipsDemo() {
  const [chips, setChips] = React.useState(["Гранулы", "Бройлеры", "БиоПро"]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Chip key={c} onRemove={() => setChips((s) => s.filter((x) => x !== c))}>
          {c}
        </Chip>
      ))}
      {chips.length ? (
        <TextButton onClick={() => setChips([])} className="ml-1">
          Сбросить все
        </TextButton>
      ) : (
        <TextButton onClick={() => setChips(["Гранулы", "Бройлеры", "БиоПро"])}>Вернуть фильтры</TextButton>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Контейнеры */

function TabsDemo() {
  return (
    <div className="grid min-w-0 gap-8">
      <Tabs defaultValue="specs">
        <TabsList>
          <TabsTrigger value="specs">Характеристики</TabsTrigger>
          <TabsTrigger value="desc">Описание</TabsTrigger>
          <TabsTrigger value="composition">Состав</TabsTrigger>
          <TabsTrigger value="usage">Применение</TabsTrigger>
          <TabsTrigger value="docs">
            <Paperclip /> Документы <Counter>3</Counter>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="text-body text-text-muted">
          Таблица «поле — значение» и график сезонного применения.
        </TabsContent>
        <TabsContent value="desc" className="text-body text-text-muted">
          Два абзаца описания и четыре преимущества.
        </TabsContent>
        <TabsContent value="composition" className="text-body text-text-muted">
          Содержание действующих веществ.
        </TabsContent>
        <TabsContent value="usage" className="text-body text-text-muted">
          Как применять: корневая и некорневая подкормка, рекомендации.
        </TabsContent>
        <TabsContent value="docs" className="text-body text-text-muted">
          Документы на товар с кнопкой «Скачать» у каждого.
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Все заказы <Counter>56</Counter>
          </TabsTrigger>
          <TabsTrigger value="work">
            В работе <Counter>2</Counter>
          </TabsTrigger>
          <TabsTrigger value="done">Выполненные</TabsTrigger>
          <TabsTrigger value="cancelled">Отменённые</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function AccordionDemo() {
  return (
    <Accordion type="multiple" defaultValue={["producer"]}>
      <AccordionItem value="producer">
        <AccordionTrigger>Производитель</AccordionTrigger>
        <AccordionContent>
          <FacetDemo />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="animal">
        <AccordionTrigger>Вид животного</AccordionTrigger>
        <AccordionContent className="text-text-muted">Бройлеры, несушки, свиньи, КРС, кролики.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="form">
        <AccordionTrigger>Форма выпуска</AccordionTrigger>
        <AccordionContent className="text-text-muted">Гранулы, россыпь, крупка, премикс.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="all">
        <AccordionTrigger>Все характеристики</AccordionTrigger>
        <AccordionContent className="text-text-muted">Полный список характеристик товара.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function PopoverDemo() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-1 text-body text-text">
        Выберите фасовку
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton variant="ghost" size="sm" aria-label="Что такое фасовка" className="rounded-full">
              <CircleHelp />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>Одна позиция в нескольких упаковках. У каждой фасовки свой код 1С и цена.</TooltipContent>
        </Tooltip>
        <span className="ml-2 text-caption text-text-muted">тултип — при наведении и фокусе</span>
      </div>
      <div className="flex items-center gap-1 text-body text-text">
        Сезонное применение и закупка
        <Popover>
          <HelpTrigger aria-label="Как читать график" />
          <PopoverContent>
            <PopoverHeader>Как читать график?</PopoverHeader>
            <ul className="grid gap-2 text-body">
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-xs bg-warning" /> Период закупки — сформируйте запас к сезону
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-xs bg-primary" /> Оптимальный период применения
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-xs border border-primary bg-primary-soft" /> Возможное применение
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-xs bg-neutral" /> Не рекомендуется
              </li>
            </ul>
            <PopoverDescription>
              Пример: если оптимальное применение начинается в марте, планируйте закупку с января–февраля.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
        <span className="ml-2 text-caption text-text-muted">поповер — по клику</span>
      </div>
    </div>
  );
}

function DialogDemo() {
  const [cleared, setCleared] = React.useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="danger">Очистить корзину</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Очистить корзину?</DialogTitle>
            <DialogDescription>24 позиции на 125 400 ₽ будут удалены. Отменить это действие нельзя.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="neutral">Отмена</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="danger" onClick={() => setCleared(true)}>
                Очистить
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <Phone /> Заказать звонок
          </Button>
        </DialogTrigger>
        <DialogContent size="lg" className="sm:p-0">
          <div className="grid sm:grid-cols-12">
            <div className="hidden bg-primary-soft p-8 sm:col-span-5 sm:block sm:rounded-l-lg">
              <p className="text-h2 font-semibold text-text">Менеджер перезвонит в рабочее время</p>
              <p className="mt-3 text-body text-text-muted">Пн–Чт: 09:00–18:00, Пт: 09:00–17:30</p>
            </div>
            <div className="grid gap-4 sm:col-span-7 sm:p-6">
              <DialogHeader>
                <DialogTitle>Заказать звонок</DialogTitle>
                <DialogDescription>Оставьте свои контакты, и наш менеджер свяжется с вами в ближайшее время.</DialogDescription>
              </DialogHeader>
              <Field id="call-name" label="Имя" placeholder="Как к вам обращаться" />
              <Field id="call-phone" label="Телефон" placeholder="+7" inputMode="tel" />
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                  <Button variant="neutral">Отмена</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Отправить</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {cleared ? <span className="text-caption text-text-muted">Корзина очищена (демо)</span> : null}
    </div>
  );
}

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="neutral">
          <Filter /> Фильтры <Counter>5</Counter>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
          <Counter>5</Counter>
          <SheetDescription>Фильтры каталога</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Accordion type="multiple" defaultValue={["stock", "producer"]} className="border-t-0">
            <AccordionItem value="stock">
              <AccordionTrigger>Наличие</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  <CheckboxField id="sheet-stock" label={<>В наличии <span className="text-small text-text-muted">(64)</span></>} defaultChecked />
                  <CheckboxField id="sheet-order" label={<>Под заказ <span className="text-small text-text-muted">(8)</span></>} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="producer">
              <AccordionTrigger>Производитель</AccordionTrigger>
              <AccordionContent>
                <FacetDemo />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="animal">
              <AccordionTrigger>Вид животного</AccordionTrigger>
              <AccordionContent className="text-text-muted">Бройлеры, несушки, свиньи, КРС.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetBody>
        <SheetFooter>
          <Button size="lg" className="flex-1">
            Показать 72 товара
          </Button>
          <Button size="lg" variant="neutral">
            Сбросить
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export {
  StepperDemo,
  ChoiceDemo,
  SearchDemo,
  SelectDemo,
  ExcelFilterDemo,
  FacetDemo,
  PriceRangeDemo,
  ChipsDemo,
  TabsDemo,
  AccordionDemo,
  PopoverDemo,
  DialogDemo,
  SheetDemo,
  rub,
};
