import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orçamento Familiar",
  description: "Plataforma de gestão financeira familiar e fluxo de caixa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="min-h-screen">
          <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
            <div className="mx-auto flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <a href="/" className="text-2xl font-semibold text-white">
                Orçamento Familiar
              </a>
              <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <a href="/" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                  Dashboard
                </a>
                <a href="/transactions" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                  Transações
                </a>
                <a href="/accounts" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                  Contas
                </a>
                <a href="/categories" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                  Categorias
                </a>
                <a href="/budget" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                  Previsão
                </a>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
