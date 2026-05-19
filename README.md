# Orçamento Familiar

Projeto de migração da planilha de orçamento familiar para uma plataforma web modular e escalável.

## Objetivo

Criar um sistema de gestão financeira familiar com:

- controle de receitas e despesas
- projeção de fluxo de caixa
- orçamento mensal e semanal
- redistribuição automática de sobras e déficits
- dashboards em estilo fintech
- base para multiusuário e múltiplas carteiras

## Estrutura inicial

- `ARCHITECTURE.md` — proposta de arquitetura e roadmap
- `backend/` — backend Node.js + Express + Prisma + PostgreSQL
- `frontend/` — frontend Next.js + React + Tailwind CSS
- `NovoOrcamentoFamiliarTeste.xlsx` — protótipo funcional em planilha

## Próximos passos

1. instalar dependências em `backend/` e `frontend/`
2. configurar `DATABASE_URL` para PostgreSQL
3. executar `prisma migrate dev` em `backend/`
4. iniciar `frontend` e `backend` em paralelo

## Como rodar localmente

No backend:

```bash
cd backend
npm install
npm run dev
```

No frontend:

```bash
cd frontend
npm install
npm run dev
```

Para aplicar dados de exemplo, configure `DATABASE_URL` e execute:

```bash
cd backend
npm run prisma:seed
```

