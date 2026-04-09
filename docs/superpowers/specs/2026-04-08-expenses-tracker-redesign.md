# Expenses Tracker — Full Redesign Spec
**Date:** 2026-04-08  
**Status:** Approved

---

## Overview

Complete ground-up rebuild of the expenses tracker. Wipe the existing codebase and start fresh. The goal is a premium-quality, fully functional expenses tracker with real-time data — no static or hardcoded content anywhere. Every number, chart, and table is live from PostgreSQL.

---

## Design Direction

- **Theme:** Dark & Premium — deep dark backgrounds (#0a0a0f base), purple/violet accents (#7c3aed), glassy cards with subtle borders
- **Layout:** Expanded sidebar (220px) with logo, labeled nav items, user footer
- **Typography:** Inter, tight letter-spacing on headings, muted secondary text
- **Accent colors per category:** each category has a fixed color used consistently across badges, chart segments, and icons
- **Interactions:** optimistic updates, smooth transitions, empty states for all data-less views

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Data fetching | React Query (TanStack Query v5) |
| Styling | Tailwind CSS |
| Components | Radix UI primitives |
| Charts | Recharts |
| Icons | Lucide React |

---

## Data Models

Defined as a Prisma schema (`prisma/schema.prisma`). Database: `expenses_tracker`, user: `postgres`.

### Prisma Schema
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  color     String    // hex e.g. "#7c3aed"
  icon      String    // lucide icon name e.g. "utensils"
  expenses  Expense[]
  budgets   Budget[]
  createdAt DateTime  @default(now())
}

model Expense {
  id         Int      @id @default(autoincrement())
  title      String
  amount     Decimal  @db.Decimal(10, 2)
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int
  date       DateTime
  note       String?
  createdAt  DateTime @default(now())
}

model Budget {
  id         Int      @id @default(autoincrement())
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int
  limit      Decimal  @db.Decimal(10, 2)
  month      String   // "YYYY-MM" e.g. "2026-04"
  @@unique([categoryId, month])
}
```

### Environment
```
DATABASE_URL="postgresql://postgres:Hemanth2602@localhost:5432/expenses_tracker"
```

Default categories seeded via `prisma/seed.ts` (runs once on first `prisma db seed`):  
Food, Transport, Housing, Entertainment, Health, Shopping, Other — each with a distinct color and icon.

**Dynamic data constraint:** No category names, colors, icons, or counts are hardcoded anywhere in application code. Every dropdown, chart legend, badge color, budget card, and filter option is rendered from live DB data fetched at runtime. If a user adds or deletes a category in Settings, it is reflected everywhere immediately via React Query invalidation.

---

## API Routes

All routes return JSON. Errors return `{ error: string }` with appropriate HTTP status.

| Method | Path | Description |
|---|---|---|
| GET | `/api/expenses` | All expenses, supports `?category=&month=YYYY-MM&search=&sort=` |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/[id]` | Update expense |
| DELETE | `/api/expenses/[id]` | Delete expense |
| GET | `/api/stats` | Dashboard stats: total spent, budget remaining, this-month total, savings; accepts `?month=YYYY-MM` |
| GET | `/api/analytics` | Aggregated data: monthly totals (last 12 months), per-category breakdown for a month, top merchants; accepts `?month=YYYY-MM` |
| GET | `/api/budget` | All budget limits for a month; accepts `?month=YYYY-MM` |
| PUT | `/api/budget/[category]` | Set/update budget limit for a category+month |
| GET | `/api/categories` | All categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category (only if no expenses reference it) |

---

## File Structure

```
expenses-tracker/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← root layout, renders <Sidebar> + children
│   │   ├── page.tsx                    ← redirect to /dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── budget/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── expenses/route.ts
│   │       ├── expenses/[id]/route.ts
│   │       ├── stats/route.ts
│   │       ├── analytics/route.ts
│   │       ├── budget/route.ts
│   │       ├── budget/[category]/route.ts
│   │       ├── categories/route.ts
│   │       └── categories/[id]/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx             ← expanded sidebar with logo, nav, user footer
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx          ← 4 stat cards from /api/stats
│   │   │   ├── SpendingBarChart.tsx    ← monthly bar chart from /api/analytics
│   │   │   ├── CategoryDonut.tsx       ← donut from /api/analytics
│   │   │   └── RecentExpenses.tsx      ← last 5 from /api/expenses
│   │   ├── expenses/
│   │   │   ├── ExpenseTable.tsx        ← paginated table with sort/filter
│   │   │   ├── ExpenseForm.tsx         ← add/edit dialog (Radix Dialog)
│   │   │   └── FiltersBar.tsx          ← search, category, month, sort chips
│   │   ├── analytics/
│   │   │   ├── MonthlyTrendChart.tsx   ← line chart, 12-month view
│   │   │   ├── CategoryPieChart.tsx    ← pie breakdown
│   │   │   └── TopSpendingTable.tsx    ← top merchants/titles by amount
│   │   ├── budget/
│   │   │   ├── BudgetCard.tsx          ← per-category card with progress bar
│   │   │   └── BudgetEditDialog.tsx    ← inline edit limit dialog
│   │   ├── settings/
│   │   │   ├── CategoryManager.tsx     ← add/rename/delete categories
│   │   │   └── PreferencesForm.tsx     ← currency, date format
│   │   └── ui/                         ← Button, Input, Dialog, Badge, Select, Card
│   ├── lib/
│   │   ├── prisma.ts                   ← Prisma client singleton
│   │   ├── queryClient.ts              ← React Query client (staleTime: 30s, refetchOnFocus: true)
│   │   └── hooks/
│   │       ├── useExpenses.ts          ← useQuery + useMutation for expenses
│   │       ├── useStats.ts             ← useQuery for dashboard stats
│   │       ├── useAnalytics.ts         ← useQuery for analytics aggregations
│   │       ├── useBudget.ts            ← useQuery + useMutation for budget limits
│   │       └── useCategories.ts        ← useQuery + useMutation for categories
│   └── prisma/
│       ├── schema.prisma               ← data model + DB connection
│       └── seed.ts                     ← default categories seeder
```

---

## Pages

### Dashboard (`/dashboard`)
- Sticky topbar: page title, current month label, "Export CSV" button, "Add Expense" button
- **StatsCards row (4 cards):** Total Spent, Remaining Budget, This Month, Saved — all from `/api/stats?month=YYYY-MM`. Each card has a colored top border accent and a trend indicator vs last month.
- **Charts row (2 columns):** SpendingBarChart (last 6 months, switchable to 1Y / All) + CategoryDonut (current month, with legend)
- **RecentExpenses table:** last 5 expenses with icon, title, category badge, date, amount. "View all →" links to `/expenses`
- Empty state: shown when no expenses exist yet, with a CTA to add the first one

### Expenses (`/expenses`)
- Topbar: title, transaction count + month label, "Add Expense" button
- **FiltersBar:** search input, category dropdown, month picker, sort dropdown (newest/oldest/highest/lowest)
- **Summary strip:** total matching amount, highest single expense, most frequent category, daily average — all computed from filtered results
- **ExpenseTable:** sortable columns (Description, Category, Date, Amount), edit pencil + delete trash per row, pagination (10 per page)
- **ExpenseForm dialog:** title, amount, category (select), date (date picker), note (optional textarea). Validates all required fields before submit. On submit: optimistic add to list, POST to API, invalidate queries on settle.
- Edit: pre-fills form with existing values, PUT on submit
- Delete: confirmation dialog before DELETE

### Analytics (`/analytics`)
- Month picker in topbar to change the reference month
- **MonthlyTrendChart:** line chart of total spending per month for last 12 months from `/api/analytics`
- **CategoryPieChart:** full pie with legend for the selected month
- **TopSpendingTable:** top 10 expenses by amount for the selected month (title, category, date, amount)

### Budget (`/budget`)
- Month picker in topbar
- Grid of **BudgetCards** — one per category. Each shows: category icon+name, limit amount, amount spent (from real expenses), progress bar (green → yellow → red as % increases), remaining amount
- "Set Limit" button on cards with no limit set; "Edit" on cards with a limit — opens BudgetEditDialog
- Categories with no expenses and no budget limit still show (greyed out) so user can set limits proactively

### Settings (`/settings`)
- **CategoryManager:** list of all categories with color swatch + icon. Add new (name, color picker, icon picker from lucide set). Edit name/color/icon. Delete (blocked with tooltip if category has expenses).
- **PreferencesForm:** currency symbol (text input, default "$"), date format (select: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD). Saved to localStorage — no DB needed.

---

## React Query Strategy

- `queryClient.ts` configures: `staleTime: 30_000`, `refetchOnWindowFocus: true`, `retry: 1`
- Every mutation (add/edit/delete expense, set budget, manage categories) calls `queryClient.invalidateQueries` on settle to keep all views consistent
- Optimistic updates on expense add/delete so the table updates instantly
- Query keys are structured: `['expenses', filters]`, `['stats', month]`, `['analytics', month]`, `['budget', month]`, `['categories']`

---

## Empty States

Every data view has a proper empty state (no filler data):
- Dashboard with no expenses: illustration + "Add your first expense" CTA
- Expenses table: "No expenses found" with filter reset option
- Analytics: "No data for this month" message
- Budget: all categories shown with 0 spent, prompting to set limits

---

## Error Handling

- API routes return structured `{ error: string }` on failure
- React Query `onError` shows a toast notification (small dark toast, bottom-right)
- PostgreSQL/Prisma errors surface as 500 with a user-friendly message in the UI

---

## What Gets Deleted

The entire `expenses-tracker/` directory is wiped and scaffolded fresh with `npx create-next-app`. No code from the old project is reused.
