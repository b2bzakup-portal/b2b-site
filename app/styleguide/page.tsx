import type { Metadata } from "next";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Heart,
  Printer,
  RotateCcw,
  Search,
  SearchX,
  ShoppingCart,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Badge, Counter, OrderStatusBadge, TextLink, type OrderStatus } from "@/components/ui/badge";
import { Field } from "@/components/ui/input";
import { Alert, EmptyState } from "@/components/ui/alert";
import { Section, Card, Note, Row } from "@/components/styleguide/section";
import {
  AccordionDemo,
  ChipsDemo,
  ChoiceDemo,
  DialogDemo,
  ExcelFilterDemo,
  FacetDemo,
  PopoverDemo,
  PriceRangeDemo,
  SearchDemo,
  SelectDemo,
  SheetDemo,
  StepperDemo,
  TabsDemo,
} from "@/components/styleguide/demos";
import { CatalogTableDemo } from "@/components/styleguide/table-demo";

export const metadata: Metadata = {
  title: "Компоненты",
};

const toc = [
  ["buttons", "Кнопки"],
  ["forms", "Поля и формы"],
  ["badges", "Бейджи, статусы и теги"],
  ["table", "Таблица каталога"],
  ["alerts", "Плашки и пустые состояния"],
  ["containers", "Контейнеры и наложения"],
] as const;

type ButtonVariant = "primary" | "secondary" | "info" | "neutral" | "danger";

const buttonRows: { variant: ButtonVariant; label: string; use: string; hover: string; active: string }[] = [
  {
    variant: "primary",
    label: "Основное",
    use: "«В корзину», «Оформить заказ», «Отправить заявку». Одно на экран",
    hover: "bg-primary-hover",
    active: "bg-primary-active",
  },
  {
    variant: "secondary",
    label: "Вторичное",
    use: "«Быстрый заказ», «Повторить заказ»",
    hover: "bg-primary-soft",
    active: "border-primary-active bg-primary-pressed text-primary-active",
  },
  {
    variant: "info",
    label: "Информационное",
    use: "«Экспорт в Excel», «Скачать прайс», печать",
    hover: "bg-info-soft",
    active: "border-info-ink bg-info-pressed text-info-ink",
  },
  {
    variant: "neutral",
    label: "Нейтральное",
    use: "«Отмена», «Свернуть», «Сбросить фильтры»",
    hover: "bg-border",
    active: "bg-neutral-pressed",
  },
  {
    variant: "danger",
    label: "Опасное",
    use: "«Удалить», «Очистить корзину». Всегда с подтверждением",
    hover: "bg-danger-soft",
    active: "border-danger-ink bg-danger-pressed text-danger-ink",
  },
];

const orderStatuses: OrderStatus[] = ["accepted", "confirmed", "in-work", "done", "shipped", "cancelled"];

export default function StyleguidePage() {
  return (
    <main className="container-page py-10">
      <header className="max-w-prose">
        <p className="text-small font-medium text-text-muted">b2bzakup.ru</p>
        <h1 className="mt-1 text-h1 font-semibold text-text">Компоненты</h1>
        <p className="mt-3 text-body text-text-muted">
          Витрина собранных компонентов интерфейса во всех состояниях. Порядок разделов повторяет дизайн-систему:
          кнопки, поля и формы, бейджи и статусы, таблица, плашки, контейнеры и наложения.
        </p>
        <nav aria-label="Разделы" className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {toc.map(([id, label], i) => (
            <TextLink key={id} href={`#${id}`}>
              <span className="mr-1.5 font-mono text-small text-text-muted">0{i + 1}</span>
              {label}
            </TextLink>
          ))}
        </nav>
      </header>

      <div className="mt-8">
        {/* 01 Кнопки */}
        <Section
          id="buttons"
          num="01"
          title="Кнопки"
          description="Тип кнопки выбирается по смыслу действия, а не по месту на экране. Радиус 8, Medium, иконка 16 слева, минимальная ширина 120. Наведение и нажатие показаны классами демо, живые состояния — при взаимодействии."
        >
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-200 text-body">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-small font-medium text-text-muted">
                  <th className="px-6 py-3">Тип</th>
                  <th className="px-4 py-3">Обычное</th>
                  <th className="px-4 py-3">Наведение</th>
                  <th className="px-4 py-3">Нажатие</th>
                  <th className="px-4 py-3">Отключено</th>
                  <th className="px-6 py-3">Применение</th>
                </tr>
              </thead>
              <tbody>
                {buttonRows.map((r) => (
                  <tr key={r.variant} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 font-medium text-text">{r.label}</td>
                    <td className="px-4 py-4">
                      <Button variant={r.variant}>
                        <ShoppingCart /> Действие
                      </Button>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant={r.variant} className={r.hover} tabIndex={-1} aria-hidden="true">
                        <ShoppingCart /> Действие
                      </Button>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant={r.variant} className={r.active} tabIndex={-1} aria-hidden="true">
                        <ShoppingCart /> Действие
                      </Button>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant={r.variant} disabled>
                        <ShoppingCart /> Действие
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-caption text-text-muted">{r.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Card title="Размеры 32 / 40 / 48">
              <Row>
                <Button size="sm">Компактная</Button>
                <Button size="md">Обычная</Button>
                <Button size="lg">Главное действие</Button>
              </Row>
              <Row className="mt-4">
                <Button variant="info">
                  <FileSpreadsheet /> Экспорт в Excel
                </Button>
                <Button variant="secondary">
                  <Zap /> Быстрый заказ
                </Button>
                <Button variant="neutral">
                  <RotateCcw /> Сбросить фильтры
                </Button>
              </Row>
              <div className="mt-4">
                <Button size="lg" block>
                  Оформить заказ
                </Button>
              </div>
              <Note>Главное действие в панели заказа и на телефоне растягивается на всю ширину контейнера.</Note>
            </Card>

            <Card title="Иконочные кнопки 40 и 32">
              <Row>
                <IconButton aria-label="В корзину" variant="primary">
                  <ShoppingCart />
                </IconButton>
                <IconButton aria-label="В избранное" variant="accent">
                  <Star />
                </IconButton>
                <IconButton aria-label="Фильтры">
                  <ChevronDown />
                </IconButton>
                <IconButton aria-label="Скачать" variant="info">
                  <Download />
                </IconButton>
                <IconButton aria-label="Печать" variant="info">
                  <Printer />
                </IconButton>
                <IconButton aria-label="Удалить" variant="danger">
                  <Trash2 />
                </IconButton>
                <IconButton aria-label="Удалить" disabled>
                  <Trash2 />
                </IconButton>
              </Row>
              <Row className="mt-4">
                <IconButton aria-label="В корзину" variant="primary" size="sm">
                  <ShoppingCart />
                </IconButton>
                <IconButton aria-label="В избранное" size="sm">
                  <Heart />
                </IconButton>
                <IconButton aria-label="Скачать" variant="info" size="sm">
                  <Download />
                </IconButton>
                <IconButton aria-label="Удалить" variant="danger" size="sm">
                  <Trash2 />
                </IconButton>
                <IconButton aria-label="Поиск" variant="ghost" size="sm">
                  <Search />
                </IconButton>
              </Row>
              <Note>
                40×40 с иконкой 18, в строке таблицы — 32×32 с иконкой 16. Набор иконок lucide с обводкой 1,5 px. У каждой
                иконочной кнопки обязателен aria-label.
              </Note>
            </Card>
          </div>
        </Section>

        {/* 02 Поля и формы */}
        <Section
          id="forms"
          num="02"
          title="Поля и формы"
          description="Основная высота 40 px, радиус 8, обводка 1 px; компактная 32 px — только внутри фильтров и таблиц. Метка 12 Medium над полем, подпись 12 под ним связана с полем через aria-describedby."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Состояния поля">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="f-default" label="Обычное" placeholder="Введите ИНН" />
                <Field id="f-filled" label="Заполнено" defaultValue="7700000000" />
                <Field id="f-disabled" label="Отключено" defaultValue="ООО «Ромашка»" disabled />
                <Field id="f-error" label="Ошибка" defaultValue="77000" state="error" hint="ИНН должен содержать 10 или 12 цифр" />
                <Field id="f-success" label="Успех" defaultValue="7700000000" state="success" hint="Компания найдена в реестре" />
                <Field id="f-sm" label="Компактное, 32 px" size="sm" leadingIcon={<Search />} placeholder="Найти значение" />
              </div>
              <Note>Фокус — обводка primary 2 px. В отключённом поле — замок, в ошибке — circle-alert, в успехе — галка.</Note>
            </Card>

            <Card title="Степпер количества">
              <StepperDemo />
              <Note>
                Единственный способ менять количество: старт с МЗП, шаг — кратность, ручной ввод округляется вверх при потере
                фокуса. Значение меньше МЗП остаётся видимым как нарушение: обводка danger, число danger-ink, «В корзину» гаснет,
                под таблицей плашка с требуемым количеством.
              </Note>
            </Card>

            <Card title="Выбор">
              <ChoiceDemo />
              <Note>Чекбокс 18×18 с радиусом 4 — согласия и множественный выбор строк. Радио-карточка — способ получения заказа.</Note>
            </Card>

            <Card title="Поиск">
              <SearchDemo />
              <Note>
                44 px, поле и зелёная кнопка 56 px в одном контейнере. Найденный фрагмент кода подсвечивается в выдаче; точное
                совпадение по коду 1С показывается первым с кнопкой «В корзину» прямо в подсказке.
              </Note>
            </Card>

            <Card title="Выпадающий список">
              <SelectDemo />
              <Note>
                Триггер — обычное поле с шевроном, в открытом состоянии обводка primary. Пункт 32 px: наведение — серая заливка,
                выбранный — зелёная подложка с галкой. Больше восьми пунктов — прокрутка внутри панели.
              </Note>
            </Card>

            <Card title="Excel-фильтр и меню действий">
              <ExcelFilterDemo />
              <Note>
                Та же панель, что у списка: чекбоксы 18 в пунктах, в подвале «Применить» и «Сбросить». Опасный пункт меню —
                красным.
              </Note>
            </Card>

            <Card title="Фасет фильтра">
              <FacetDemo />
              <Note>
                Строка 32 px, счётчик в скобках сразу за подписью. Видно шесть значений, остальные — по ссылке «Показать ещё».
                Значение без товаров остаётся серым и недоступным.
              </Note>
            </Card>

            <Card title="Диапазон цены">
              <PriceRangeDemo />
              <Note>Поля «от / до» и ручки слайдера связаны: ввод двигает ручку, ручка переписывает поле.</Note>
            </Card>
          </div>
        </Section>

        {/* 03 Бейджи */}
        <Section
          id="badges"
          num="03"
          title="Бейджи, статусы и теги"
          description="Единая форма: высота 26, радиус 6, поля 10, текст 12 Medium. Различает только цвет и обводка: с обводкой — требует внимания и ещё может измениться, без обводки — свершившийся факт."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Ограничения и наличие">
              <Row>
                <Badge variant="limit">МЗП: 10 кг</Badge>
                <Badge variant="limit">Кратность: 5 кг</Badge>
                <Badge variant="stock">В наличии: 350 кг</Badge>
                <Badge variant="preorder">Под заказ · от 2 дней</Badge>
                <Badge variant="out">Нет в наличии</Badge>
                <Badge variant="violation">Нельзя заказать меньше МЗП</Badge>
              </Row>
              <p className="mt-6 mb-3 text-small font-medium text-text-muted">Маркеры товара</p>
              <Row>
                <Badge variant="hit">ХИТ</Badge>
                <Badge variant="new">Новинка</Badge>
              </Row>
            </Card>

            <Card title="Статусы заказа">
              <Row>
                {orderStatuses.map((s) => (
                  <OrderStatusBadge key={s} status={s} />
                ))}
              </Row>
              <Note>
                «Подтверждён» и «Отгружен», «В работе» и «Выполнен» различаются обводкой, а не оттенком: в палитре по одному синему
                и зелёному.
              </Note>
            </Card>

            <Card title="Чипы фильтров и текстовая ссылка">
              <ChipsDemo />
              <Note>Чип 32 px с крестиком снимает фильтр; последней в ряду — ссылка «Сбросить все». Ссылка подчёркивается только при наведении и фокусе.</Note>
            </Card>

            <Card title="Теги свойств и счётчики">
              <Row>
                <Badge variant="tag">Гранулы</Badge>
                <Badge variant="tag">Бройлеры</Badge>
                <Badge variant="tag">Стартовый период</Badge>
                <Badge variant="tag-more">+3</Badge>
              </Row>
              <Row className="mt-5">
                <span className="inline-flex items-center gap-2 text-body text-text">
                  <ShoppingCart className="size-4.5 text-text-muted" /> Корзина <Counter>12</Counter>
                </span>
                <span className="inline-flex items-center gap-2 text-body text-text">
                  <Star className="size-4.5 text-text-muted" /> Избранное <Counter>4</Counter>
                </span>
                <span className="inline-flex items-center gap-2 text-body text-text">
                  Документы <Counter>3</Counter>
                </span>
              </Row>
              <Note>Теги в карточке товара кликабельны — это ссылки на разделы каталога. Счётчик-бейдж озвучивается вместе с назначением.</Note>
            </Card>
          </div>
        </Section>

        {/* 04 Таблица */}
        <Section
          id="table"
          num="04"
          title="Таблица каталога"
          description="Строка 64 px, шапка 48 px с заливкой bg, числа вправо, коды моноширинным. Таблица прокручивается внутри себя, колонки товара и действий закреплены по краям; шапка липнет к верху."
        >
          <CatalogTableDemo />
          <Note>
            Строка с нарушением красится в danger-row, степпер получает обводку danger, кнопка «В корзину» гаснет, под таблицей —
            плашка с именем позиции и требуемым количеством. Служебные колонки скрываются переключателем, настройка сохраняется.
          </Note>
        </Section>

        {/* 05 Плашки */}
        <Section
          id="alerts"
          num="05"
          title="Плашки и пустые состояния"
          description="Плашка сообщает о результате действия, пустое состояние — о том, что делать дальше. Ни то, ни другое не оставляет пользователя без следующего шага."
        >
          <div className="grid gap-3">
            <Alert variant="success" title="Заказ № 4512 принят" description="Менеджер свяжется с вами в течение рабочего дня. Счёт придёт на почту." />
            <Alert variant="info" title="Прайс-лист обновляется раз в сутки" description="Актуальные остатки и цены — в каталоге и личном кабинете." />
            <Alert
              variant="warning"
              title="4 позиции из файла требуют уточнения"
              description="Код найден, но количество меньше минимальной партии. Проверьте выделенные строки."
              action={<Button variant="neutral" size="sm">Показать строки</Button>}
            />
            <Alert
              variant="danger"
              title="Файл не распознан"
              description="Поддерживаются XLSX, CSV и список кодов текстом. Скачайте шаблон и заполните его."
              action={
                <Button variant="info" size="sm">
                  <Download /> Скачать шаблон
                </Button>
              }
            />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <EmptyState
              icon={<ShoppingCart />}
              title="Корзина пуста"
              description="Добавьте товары из каталога или загрузите список кодов файлом — счёт будет готов за минуту."
              actions={
                <>
                  <Button>Перейти в каталог</Button>
                  <Button variant="secondary">Быстрый заказ</Button>
                </>
              }
            />
            <EmptyState
              icon={<Star />}
              title="В избранном пусто"
              description="Отмечайте звёздочкой позиции, которые заказываете регулярно: они соберутся в отдельный список."
              actions={<Button>Перейти в каталог</Button>}
            />
            <EmptyState
              icon={<SearchX />}
              title="Ничего не найдено"
              description="Проверьте код 1С или попробуйте искать по названию. Можно сбросить фильтры и посмотреть весь раздел."
              actions={
                <>
                  <Button>Сбросить фильтры</Button>
                  <Button variant="secondary">Заказать звонок</Button>
                </>
              }
            />
          </div>
        </Section>

        {/* 06 Контейнеры */}
        <Section
          id="containers"
          num="06"
          title="Контейнеры и наложения"
          description="Вкладки и аккордеон делят содержимое страницы, поповер и тултип поясняют, модальное окно и шторка перекрывают страницу. Тень одна на всех; полупрозрачная подложка под окном — единственное допустимое затемнение."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Вкладки">
              <TabsDemo />
              <Note>Активная вкладка подчёркнута зелёным на 2 px поверх серой линии ряда. На узком экране ряд прокручивается.</Note>
            </Card>
            <Card title="Аккордеон">
              <AccordionDemo />
              <Note>Заголовок 48 px, шеврон поворачивается при раскрытии. Раскрытие одной секции не сворачивает остальные.</Note>
            </Card>
            <Card title="Поповер и тултип">
              <PopoverDemo />
              <Note>Триггер — кнопка «?» 32 px без рамки. Поповер закрывается по ✕, Esc и клику вне. Стрелок-хвостиков нет.</Note>
            </Card>
            <Card title="Модальное окно и шторка">
              <div className="grid gap-4">
                <DialogDemo />
                <SheetDemo />
              </div>
              <Note>
                Подложка — основной цвет текста с прозрачностью 40 %. Окно 480 px для подтверждений, 960 px — двухколоночное с
                промо-колонкой; на телефоне окно становится шторкой снизу. Шторка справа 360 px, во всю ширину на телефоне. Esc
                закрывает, фокус остаётся внутри.
              </Note>
            </Card>
          </div>
        </Section>
      </div>
    </main>
  );
}
