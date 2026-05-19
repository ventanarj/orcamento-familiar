# Orçamento Familiar — Arquitetura proposta

## Visão geral

Objetivo: transformar a planilha existente em uma plataforma web modular, escalável e orientada a fluxo de caixa com suporte a multiusuário, múltiplas carteiras e projeções financeiras.

### Camadas principais

- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
- Frontend: Next.js + React + Tailwind CSS
- Arquitetura: domínio financeiro, orquestração de orçamento, projeções, dashboards e importação.
- Evolução futura: microserviços por domínio, Open Finance, mobile, notificações e IA.

## Domínio financeiro

### Entidades centrais

- `User` / `Household` / `Workspace`
- `Account` / `Card`
- `Category` / `Subcategory`
- `Transaction` (receita / despesa / parcelamento)
- `BudgetCycle` (ciclo mensal ou semanal)
- `BudgetAllocation` (percentual por categoria)
- `WeeklyProjection` / `CashFlowProjection`
- `Recurrence` / `Installment`

### Regras capturadas da planilha

- Orçamento mensal distribuído proporcionalmente entre semanas.
- Sobras das semanas anteriores são redistribuídas automaticamente para semanas futuras.
- Déficits reduzem disponibilidade futura.
- Categorias possuem percentuais, limites e agrupamentos.
- Fluxo temporal diferencia passado/atual/futuro.
- Recebíveis são a base transacional de data, conta, categoria, valor, tipo e status.
- Planilha usa `SUMIFS` para cálculo de consumos por semana e categoria e `INDIRECT` para vincular o mesmo fluxo de dados ao painel semanal.

## Modelo de banco de dados proposto

### Tabelas principais

- `users`
- `households`
- `accounts`
- `categories`
- `transactions`
- `recurrences`
- `budget_cycles`
- `budget_allocations`
- `weekly_allocations`
- `cash_flow_events`

### Relacionamentos-chave

- Um `Household` tem muitos `User`, `Account`, `Category`, `Transaction` e `BudgetCycle`.
- `Transaction` pertence a `Account`, `Category` e pode ter `Recurrence`.
- `BudgetCycle` agrega `BudgetAllocation`, que por sua vez define `WeeklyAllocation`.

## APIs principais

### Autenticação

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

### Financeiro

- `GET /api/accounts`
- `POST /api/accounts`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/transactions`
- `POST /api/transactions`
- `PATCH /api/transactions/:id`
- `POST /api/transactions/import`

### Orçamento e projeção

- `GET /api/budget/cycles`
- `POST /api/budget/cycles`
- `GET /api/budget/forecast`
- `GET /api/forecast/weekly`

### Dashboards

- `GET /api/dashboard/summary`
- `GET /api/dashboard/indicators`
- `GET /api/dashboard/category-performance`

### Importação

- `POST /api/import/csv`
- `POST /api/import/xlsx`
- `POST /api/import/card-statement`

## Estrutura de pastas sugerida

```
/ backend/
  / prisma/
  / src/
    / api/
    / config/
    / domain/
      / transaction/
      / category/
      / budget/
      / forecast/
    / infrastructure/
      / database/
      / import/
    / shared/

/ frontend/
  / app/
  / components/
  / lib/
  / styles/
  / hooks/

/ docs/
  ARCHITECTURE.md
```

## MVP recomendado

### 1. Cadastro financeiro básico

- transações (receitas e despesas)
- contas
- categorias e subcategorias
- cartões

### 2. Fluxo de caixa e orçamento

- visão de saldo atual e projetado
- ciclo orçamentário mensal
- distribuição semanal percentual
- cálculo de sobras e déficits

### 3. Dashboards iniciais

- visão mensal
- visão semanal
- indicadores de consumo por categoria
- evolução patrimonial simples

### 4. Importação básica

- CSV/XLSX
- conversão de planilha para transações

## Roadmap de evolução

1. Versão 1 (MVP): backend + frontend + PostgreSQL + importação CSV/XLSX
2. Versão 2: recorrência de parcelas, projeção automática, multiusuário/família
3. Versão 3: integração bancária, Open Finance, notificações, mobile
4. Versão 4: IA de análise financeira, recomendação de orçamento, dashboards avançados

## Riscos técnicos

- Complexidade de conversão de fórmulas Excel baseadas em `INDIRECT` e `SUMIFS` para lógica de domínio.
- Uso de dados temporais e valores projetados exigirá testes automatizados de regressão.
- Plano inicial deve manter separação clara entre dados transacionais e regras de previsão.

## Próximo passo

Implementar a primeira iteração do backend e do frontend com foco em:

- modelo de transações + categorias
- orçamento e projeção semanal
- UI fintech responsiva com dashboard inicial
