import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Компоненты",
};

export default function StyleguidePage() {
  return (
    <main className="container-page py-12">
      <h1 className="text-h1 font-semibold">Компоненты</h1>
      <p className="mt-3 text-text-muted">
        Витрина компонентов интерфейса. Наполняется по мере сборки.
      </p>
    </main>
  );
}
