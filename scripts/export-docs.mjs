// Копирует статический экспорт Next.js (out/) в docs/, откуда GitHub Pages
// отдаёт сайт. Старая сборка (_next/) удаляется, остальное содержимое docs/
// (страницы дизайн-системы, ход работ, заглушка index.html) остаётся на месте.
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out/", import.meta.url));
const docs = fileURLToPath(new URL("../docs/", import.meta.url));
const built = fileURLToPath(new URL("../docs/_next/", import.meta.url));

if (!existsSync(out)) {
  console.error("Папки out/ нет — сначала выполните pnpm build.");
  process.exit(1);
}

rmSync(built, { recursive: true, force: true });
cpSync(out, docs, { recursive: true, force: true });
console.log("Экспорт скопирован: out/ → docs/");
