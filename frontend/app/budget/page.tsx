"use client";

import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { CalendarDays, DollarSign, Layers, Shuffle } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number) {
  return `${Number(value).toFixed(0)}%`;
}

function statusLabel(status: "onTrack" | "warning" | "over") {
  if (status === "over") return "Estourado";
  if (status === "warning") return "Atenção";
  return "No alvo";
}

export default function BudgetPage() {
  const { data, error } = useSWR("/api/budget/forecast", fetcher, { refreshInterval: 15000 });

  const totals = data?.totals;
  const allocations = data?.allocations || [];
  const weeklyDistribution = data?.weeklyDistribution || [];
  const redistribution = data?.redistribution || [];
  const cycle = data?.budgetCycle;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Previsão orçamentária</p>
          <h1 className="text-3xl font-semibold text-white">Fluxo e envelopes do ciclo</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Veja o status dos envelopes, uso por categoria e a distribuição semanal do orçamento.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200 shadow-xl shadow-slate-950/20">
          <CalendarDays size={16} /> Ciclo atual
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Orçamento</p>
            <span className="rounded-2xl bg-slate-800/60 p-3 text-slate-200">
              <DollarSign size={18} />
            </span>
          </div>
          <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(totals?.totalPlanned ?? 0)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Gastos</p>
            <span className="rounded-2xl bg-slate-800/60 p-3 text-slate-200">
              <Layers size={18} />
            </span>
          </div>
          <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(totals?.totalActualSpent ?? 0)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Receitas</p>
            <span className="rounded-2xl bg-slate-800/60 p-3 text-slate-200">
              <Shuffle size={18} />
            </span>
          </div>
          <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(totals?.totalIncome ?? 0)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo projetado</p>
            <span className="rounded-2xl bg-slate-800/60 p-3 text-slate-200">
              <CalendarDays size={18} />
            </span>
          </div>
          <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(totals?.projectedBalance ?? 0)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Ciclo</p>
            <h2 className="text-xl font-semibold text-white">{cycle?.name ?? "Sem ciclo"}</h2>
            <p className="text-sm text-slate-400">
              {cycle ? new Date(cycle.startDate).toLocaleDateString("pt-BR") : "-"} até {cycle ? new Date(cycle.endDate).toLocaleDateString("pt-BR") : "-"}
            </p>
          </div>
          <div className="rounded-3xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            Base do ciclo: {formatCurrency(cycle?.baseAmount ?? 0)}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Envelope por categoria</h2>
              <p className="mt-2 text-sm text-slate-400">Acompanhe o uso real frente ao planejado por categoria.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {allocations.map((allocation: any) => (
              <div key={allocation.categoryId} className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{allocation.categoryName}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(allocation.plannedAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Uso atual</p>
                    <p className="text-xl font-semibold text-white">{formatCurrency(allocation.actualSpent)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-300">
                  <span>Limite {formatCurrency(allocation.limit)}</span>
                  <span>{statusLabel(allocation.performance)}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${allocation.performance === "over" ? "bg-rose-400" : allocation.performance === "warning" ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${allocation.percentUsed}%` }}
                  />
                </div>
              </div>
            ))}
            {!allocations.length && <p className="text-sm text-slate-400">Nenhuma categoria de orçamento encontrada.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Redistribuição sugerida</h2>
          <p className="mt-2 text-sm text-slate-400">Ajuste envelopes com sobra para cobrir déficits de outras categorias.</p>

          <div className="mt-6 space-y-3">
            {redistribution.length > 0 ? (
              redistribution.map((item: any, index: number) => (
                <div key={`${item.fromCategoryId}-${item.toCategoryId}-${index}`} className="rounded-3xl bg-slate-950/90 p-4">
                  <p className="text-sm text-slate-400">
                    Transferir <span className="font-semibold text-white">{formatCurrency(item.amount)}</span> de <span className="text-white">{item.fromCategoryName}</span> para <span className="text-white">{item.toCategoryName}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhuma redistribuição recomendada até o momento.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Distribuição semanal</h2>
            <p className="mt-2 text-sm text-slate-400">Estimativa de uso semanal dos envelopes de orçamento.</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/90">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/90 text-slate-400">
              <tr>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Semana</th>
                <th className="px-4 py-3 text-right">Percentual</th>
                <th className="px-4 py-3 text-right">Esperado</th>
                <th className="px-4 py-3 text-right">Reservado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/90">
              {weeklyDistribution.flatMap((item: any) =>
                item.weeks.map((week: any) => (
                  <tr key={`${item.categoryId}-${week.weekIndex}`} className="hover:bg-slate-900/80">
                    <td className="px-4 py-4 text-slate-100">{item.categoryName}</td>
                    <td className="px-4 py-4 text-slate-400">Semana {week.weekIndex}</td>
                    <td className="px-4 py-4 text-right text-slate-400">{formatPercent(week.percent)}</td>
                    <td className="px-4 py-4 text-right text-white">{formatCurrency(week.expected)}</td>
                    <td className="px-4 py-4 text-right text-slate-300">{formatCurrency(week.reserved)}</td>
                  </tr>
                )),
              )}
              {!weeklyDistribution.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Nenhuma informação semanal encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-rose-300">Erro ao carregar previsão orçamentária.</p>}
    </section>
  );
}
