"use client";

import useSWR from "swr";
import { ArrowUpRight, CalendarDays, CreditCard, TrendingUp } from "lucide-react";
import { fetcher } from "../../lib/fetcher";

const tiles = [
  { title: "Saldo atual", key: "balance", icon: TrendingUp },
  { title: "Orçamento mensal", key: "budget", icon: CalendarDays },
  { title: "Despesas previstas", key: "expenses", icon: CreditCard },
  { title: "Sobras projetadas", key: "surplus", icon: ArrowUpRight },
];

function formatCurrency(value: number | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

export default function DashboardShell() {
  const { data: transactions, error: txError } = useSWR("/api/transactions", fetcher, { refreshInterval: 10000 });
  const { data: categories } = useSWR("/api/categories", fetcher);
  const { data: accounts } = useSWR("/api/accounts", fetcher);
  const { data: budgetCycle } = useSWR("/api/budget/cycle", fetcher);

  const totalBalance = accounts?.reduce((sum: number, account: any) => sum + Number(account.balance), 0) ?? 0;
  const totalExpenses = transactions?.filter((tx: any) => tx.type === "EXPENSE").reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) ?? 0;
  const totalIncome = transactions?.filter((tx: any) => tx.type === "INCOME").reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) ?? 0;
  const estimatedBudget = Number(budgetCycle?.baseAmount ?? 0);
  const surplus = totalIncome + totalBalance + estimatedBudget + totalExpenses;

  const metrics: Record<string, number> = {
    balance: totalBalance,
    budget: estimatedBudget,
    expenses: Math.abs(totalExpenses),
    surplus,
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Orçamento familiar</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Painel de fluxo de caixa</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Visão mensal e semanal com projeção de sobras, déficits e distribuição de orçamento por categoria.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.title} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{tile.title}</p>
                <span className="rounded-2xl bg-slate-800/60 p-3 text-slate-200">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(metrics[tile.key])}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Resumo de gestão</h2>
              <p className="mt-2 text-sm text-slate-400">Controle os principais indicadores do ciclo atual.</p>
            </div>
            <span className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Atual</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm text-slate-500">Receitas</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm text-slate-500">Despesas</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(Math.abs(totalExpenses))}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Categorias ativas</h2>
          <div className="mt-6 space-y-4">
            {categories?.slice(0, 3).map((category: any) => {
              const limit = Number(category.limit) || 0;
              const usage = Math.min(100, Math.round((limit > 0 ? Math.random() * 100 : 30)));
              return (
                <div key={category.id} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{category.name}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(limit)}</p>
                    </div>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-sm text-slate-200">{usage}%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${usage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Últimas transações</h2>
            <p className="mt-2 text-sm text-slate-400">Transações de receitas e despesas lançadas no ciclo atual.</p>
          </div>
          <span className="rounded-2xl bg-slate-800/60 px-3 py-1 text-sm text-slate-200">
            {transactions ? transactions.length : 0} lançadas
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/90">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/90 text-slate-400">
              <tr>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Conta</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/90">
              {transactions?.slice(0, 6).map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-slate-900/80">
                  <td className="px-4 py-4 text-slate-100">{transaction.description}</td>
                  <td className="px-4 py-4 text-slate-400">{transaction.account?.name ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-400">{transaction.category?.name ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-400">{new Date(transaction.date).toLocaleDateString("pt-BR")}</td>
                  <td className={`px-4 py-4 text-right ${transaction.amount < 0 ? "text-rose-400" : "text-emerald-300"}`}>
                    {formatCurrency(Number(transaction.amount))}
                  </td>
                </tr>
              ))}
              {!transactions?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {txError && <p className="mt-4 text-sm text-rose-300">Erro ao carregar transações.</p>}
      </div>
    </section>
  );
}
