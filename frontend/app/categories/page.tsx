"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { Tag, Plus } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function CategoriesPage() {
  const { data: categories, error, mutate } = useSWR("/api/categories", fetcher);
  const [name, setName] = useState("");
  const [type, setType] = useState("REGULAR");
  const [allocationPercent, setAllocationPercent] = useState("0");
  const [limit, setLimit] = useState("0");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      name,
      type,
      allocationPercent: Number(allocationPercent),
      limit: Number(limit),
    };

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Erro ao criar categoria");
      }

      setName("");
      setAllocationPercent("0");
      setLimit("0");
      setMessage("Categoria criada com sucesso.");
      await mutate();
    } catch (error) {
      setMessage(String(error));
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Categorias</p>
          <h1 className="text-3xl font-semibold text-white">Organize seu orçamento por propósito</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Crie categorias de gasto, limite valores e defina alocação mensal.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200 shadow-xl shadow-slate-950/20">
          <Tag size={16} /> Nova categoria
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Cadastrar categoria</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm text-slate-300">
              Nome da categoria
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                placeholder="Ex: Mercado"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300">
                Tipo
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="REGULAR">Regular</option>
                  <option value="SAVINGS">Poupança</option>
                  <option value="BILL">Conta</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Alocação (%)
                <input
                  type="number"
                  step="1"
                  value={allocationPercent}
                  onChange={(event) => setAllocationPercent(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Limite mensal
                <input
                  type="number"
                  step="0.01"
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Use limites para controlar quanto pode ser gasto em cada categoria.</p>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                Criar categoria
              </button>
            </div>
            {message && <p className="text-sm text-emerald-300">{message}</p>}
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Categorias cadastradas</h2>
          <div className="mt-6 space-y-4">
            {categories?.map((category: any) => (
              <div key={category.id} className="rounded-3xl border border-slate-800/70 bg-slate-950/90 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{category.type}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{category.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Alocação</p>
                    <p className="text-lg font-semibold text-white">{category.allocationPercent}%</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-300">
                  <span>Limite {formatCurrency(Number(category.limit || 0))}</span>
                  <span>{category.transactions?.length ?? 0} transações</span>
                </div>
              </div>
            ))}
            {!categories?.length && <p className="text-sm text-slate-400">Ainda não há categorias cadastradas.</p>}
          </div>
          {error && <p className="mt-4 text-sm text-rose-300">Erro ao carregar categorias.</p>}
        </div>
      </div>
    </section>
  );
}
