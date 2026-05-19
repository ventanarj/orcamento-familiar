"use client";

import { useEffect, useState, type FormEvent } from "react";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { ArrowRight, Plus } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function TransactionsPage() {
  const { data: transactions, error: transactionsError, mutate } = useSWR("/api/transactions", fetcher);
  const { data: accounts } = useSWR("/api/accounts", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);

  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState("EXPENSE");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!accountId && accounts?.length) setAccountId(accounts[0].id);
    if (!categoryId && categories?.length) setCategoryId(categories[0].id);
  }, [accounts, categories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      description,
      date,
      amount: Number(amount),
      type,
      accountId,
      categoryId,
      status: "CONFIRMED",
      isPlanned: true,
    };

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Falha ao criar transação");
      }

      setDescription("");
      setAmount("0");
      setType("EXPENSE");
      setMessage("Transação criada com sucesso.");
      await mutate();
    } catch (error) {
      setMessage(String(error));
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Transações</p>
          <h1 className="text-3xl font-semibold text-white">Registro de lançamentos</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Adicione e consulte receitas e despesas do ciclo atual.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200 shadow-xl shadow-slate-950/20">
          <Plus size={16} /> Nova transação
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Cadastre uma transação</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Descrição
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  placeholder="Ex: Supermercado"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Data
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300">
                Valor
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Tipo
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Conta
                <select
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  {accounts?.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Categoria
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              >
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Use o formulário para registrar fluxos de caixa recorrentes e eventuais.</p>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                Criar transação
                <ArrowRight size={16} />
              </button>
            </div>
            {message && <p className="text-sm text-emerald-300">{message}</p>}
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Últimas transações</h2>
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
                {transactions?.slice(0, 8).map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-slate-900/80">
                    <td className="px-4 py-4 text-slate-100">{transaction.description}</td>
                    <td className="px-4 py-4 text-slate-400">{transaction.account?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-400">{transaction.category?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-400">{new Date(transaction.date).toLocaleDateString("pt-BR")}</td>
                    <td className={`px-4 py-4 text-right ${transaction.amount < 0 ? "text-rose-400" : "text-emerald-300"}`}>
                      {formatCurrency(transaction.amount)}
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
          {transactionsError && <p className="mt-4 text-sm text-rose-300">Erro ao carregar transações.</p>}
        </div>
      </div>
    </section>
  );
}
