# Expenses Tracker — Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the expenses tracker from scratch as a premium dark-themed Next.js 14 app with PostgreSQL (Prisma), React Query, fully dynamic data, and 5 pages: Dashboard, Expenses, Analytics, Budget, Settings.

**Architecture:** Next.js App Router with client-side TanStack Query v5 for all data fetching. API routes run Prisma queries against PostgreSQL. Custom hooks wrap queries/mutations. Components are purely presentational — zero hardcoded data; all categories, colors, and icons come live from the database.

**Tech Stack:** Next.js 14 (App Router), TypeScript, PostgreSQL + Prisma ORM, TanStack Query v5, Tailwind CSS, Radix UI, Recharts, Lucide React, Sonner (toasts)

---

## File Map

```
expenses-tracker/
├── .env                                         ← DATABASE_URL
├── prisma/
│   ├── schema.prisma                            ← Category, Expense, Budget models
│   └── seed.ts                                  ← default categories seeder
├── src/
│   ├── app/
│   │   ├── globals.css                          ← Tailwind + CSS variables
│   │   ├── layout.tsx                           ← root layout: Sidebar + Providers
│   │   ├── page.tsx                             ← redirect → /dashboard
│   │   ├── providers.tsx                        ← 'use client' QueryClientProvider
│   │   ├── dashboard/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── budget/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── categories/route.ts              ← GET, POST
│   │       ├── categories/[id]/route.ts         ← PUT, DELETE
│   │       ├── expenses/route.ts                ← GET (filtered), POST
│   │       ├── expenses/[id]/route.ts           ← PUT, DELETE
│   │       ├── stats/route.ts                   ← GET ?month=YYYY-MM
│   │       ├── analytics/route.ts               ← GET ?month=YYYY-MM
│   │       ├── budget/route.ts                  ← GET ?month=YYYY-MM
│   │       └── budget/[categoryId]/route.ts     ← PUT
│   ├── lib/
│   │   ├── prisma.ts                            ← Prisma client singleton
│   │   └── hooks/
│   │       ├── useCategories.ts
│   │       ├── useExpenses.ts
│   │       ├── useStats.ts
│   │       ├── useAnalytics.ts
│   │       └── useBudget.ts
│   └── components/
│       ├── layout/Sidebar.tsx
│       ├── ui/
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Badge.tsx
│       │   ├── Card.tsx
│       │   ├── Dialog.tsx
│       │   └── Select.tsx
│       ├── dashboard/
│       │   ├── StatsCards.tsx
│       │   ├── SpendingBarChart.tsx
│       │   ├── CategoryDonut.tsx
│       │   └── RecentExpenses.tsx
│       ├── expenses/
│       │   ├── FiltersBar.tsx
│       │   ├── ExpenseForm.tsx
│       │   └── ExpenseTable.tsx
│       ├── analytics/
│       │   ├── MonthlyTrendChart.tsx
│       │   ├── CategoryPieChart.tsx
│       │   └── TopSpendingTable.tsx
│       ├── budget/
│       │   ├── BudgetCard.tsx
│       │   └── BudgetEditDialog.tsx
│       └── settings/
│           ├── CategoryManager.tsx
│           └── PreferencesForm.tsx
```

---

### Task 1: Scaffold fresh Next.js project

**Files:**
- Create: `expenses-tracker-new/` (entire new project, swap at end)

- [ ] **Step 1: Scaffold into a sibling directory**

```bash
cd /Users/yakahemanth/Downloads/demo
npx create-next-app@14 expenses-tracker-new \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Wait for completion. This creates `expenses-tracker-new/` with App Router + Tailwind + TypeScript.

- [ ] **Step 2: Move the docs directory to safety**

```bash
cp -r expenses-tracker/docs expenses-tracker-new/docs
```

- [ ] **Step 3: Remove the old project**

```bash
rm -rf expenses-tracker
mv expenses-tracker-new expenses-tracker
cd expenses-tracker
```

- [ ] **Step 4: Verify scaffold**

```bash
ls src/app/
# Expected: globals.css  layout.tsx  page.tsx  favicon.ico
```

- [ ] **Step 5: Commit baseline**

```bash
git init
git add .
git commit -m "chore: scaffold fresh Next.js 14 app"
```

---

### Task 2: Install all dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install \
  @prisma/client \
  @tanstack/react-query \
  @radix-ui/react-dialog \
  @radix-ui/react-select \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-tooltip \
  recharts \
  lucide-react \
  sonner \
  clsx \
  tailwind-merge \
  date-fns
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma ts-node @types/node
```

- [ ] **Step 3: Verify install**

```bash
npm ls @tanstack/react-query prisma recharts
# Expected: all three listed without errors
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install dependencies"
```

---

### Task 3: Prisma schema, .env, migrate, seed

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `.env`
- Modify: `package.json` (add seed script)

- [ ] **Step 1: Create .env**

```bash
echo 'DATABASE_URL="postgresql://postgres:Hemanth2602@localhost:5432/expenses_tracker"' > .env
```

- [ ] **Step 2: Initialise Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma`. Replace its contents entirely.

- [ ] **Step 3: Write schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  color     String
  icon      String
  expenses  Expense[]
  budgets   Budget[]
  createdAt DateTime  @default(now())
}

model Expense {
  id         Int      @id @default(autoincrement())
  title      String
  amount     Decimal  @db.Decimal(10, 2)
  categoryId Int
  category   Category @relation(fields: [categoryId], references: [id])
  date       DateTime
  note       String?
  createdAt  DateTime @default(now())
}

model Budget {
  id         Int      @id @default(autoincrement())
  categoryId Int
  category   Category @relation(fields: [categoryId], references: [id])
  limit      Decimal  @db.Decimal(10, 2)
  month      String

  @@unique([categoryId, month])
}
```

- [ ] **Step 4: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 5: Write seed file**

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaults = [
    { name: 'Food',          color: '#7c3aed', icon: 'utensils' },
    { name: 'Transport',     color: '#10b981', icon: 'car' },
    { name: 'Housing',       color: '#6366f1', icon: 'home' },
    { name: 'Entertainment', color: '#ec4899', icon: 'tv' },
    { name: 'Health',        color: '#f59e0b', icon: 'heart-pulse' },
    { name: 'Shopping',      color: '#3b82f6', icon: 'shopping-bag' },
    { name: 'Other',         color: '#6b7280', icon: 'more-horizontal' },
  ]

  for (const cat of defaults) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }
  console.log('Seeded default categories.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 6: Add seed script to package.json**

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 7: Run seed**

```bash
npx prisma db seed
```

Expected: `Seeded default categories.`

- [ ] **Step 8: Verify in Prisma Studio**

```bash
npx prisma studio
```

Open `http://localhost:5555` → Category table should show 7 rows. Close studio after verifying.

- [ ] **Step 9: Commit**

```bash
git add prisma/ .env package.json
git commit -m "feat: prisma schema, migration, and seed"
```

---

### Task 4: Prisma client singleton

**Files:**
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Create singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "feat: prisma client singleton"
```

---

### Task 5: Categories API routes

**Files:**
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/categories/[id]/route.ts`

- [ ] **Step 1: Create GET/POST route**

Create `src/app/api/categories/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, color, icon } = body

    if (!name || !color || !icon) {
      return NextResponse.json({ error: 'name, color, and icon are required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), color, icon },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create category'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create PUT/DELETE [id] route**

Create `src/app/api/categories/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, color, icon } = body

    const category = await prisma.category.update({
      where: { id },
      data: { name: name?.trim(), color, icon },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const expenseCount = await prisma.expense.count({ where: { categoryId: id } })
    if (expenseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing expenses' },
        { status: 409 }
      )
    }

    await prisma.budget.deleteMany({ where: { categoryId: id } })
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Test the routes**

```bash
npm run dev &
sleep 3

# GET categories
curl http://localhost:3000/api/categories
# Expected: JSON array of 7 categories

# POST new category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","color":"#ff0000","icon":"star"}'
# Expected: {"id":8,"name":"Test",...}

# DELETE it (use the id from above response)
curl -X DELETE http://localhost:3000/api/categories/8
# Expected: {"success":true}

kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/categories/
git commit -m "feat: categories API routes"
```

---

### Task 6: Expenses API routes

**Files:**
- Create: `src/app/api/expenses/route.ts`
- Create: `src/app/api/expenses/[id]/route.ts`

- [ ] **Step 1: Create GET/POST route**

Create `src/app/api/expenses/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const month = searchParams.get('month')   // "YYYY-MM"
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') ?? 'newest'
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = { name: category }
    }

    if (month) {
      const [year, mon] = month.split('-').map(Number)
      where.date = {
        gte: new Date(year, mon - 1, 1),
        lt:  new Date(year, mon, 1),
      }
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }

    const orderBy =
      sort === 'oldest'  ? { date: 'asc' as const } :
      sort === 'highest' ? { amount: 'desc' as const } :
      sort === 'lowest'  ? { amount: 'asc' as const } :
                           { date: 'desc' as const }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      prisma.expense.count({ where }),
    ])

    return NextResponse.json({
      expenses: expenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      total,
      page,
      pageCount: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, amount, categoryId, date, note } = body

    if (!title || !amount || !categoryId || !date) {
      return NextResponse.json(
        { error: 'title, amount, categoryId, and date are required' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount,
        categoryId: parseInt(categoryId),
        date: new Date(date),
        note: note?.trim() || null,
      },
      include: { category: true },
    })

    return NextResponse.json(
      {
        ...expense,
        amount: Number(expense.amount),
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create PUT/DELETE [id] route**

Create `src/app/api/expenses/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { title, amount, categoryId, date, note } = body

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title: title?.trim(),
        amount,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        date: date ? new Date(date) : undefined,
        note: note?.trim() || null,
      },
      include: { category: true },
    })

    return NextResponse.json({
      ...expense,
      amount: Number(expense.amount),
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Test the routes**

```bash
npm run dev &
sleep 3

# POST an expense (use a real categoryId from your DB, e.g. 1)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"title":"Test lunch","amount":12.50,"categoryId":1,"date":"2026-04-08"}'
# Expected: {"id":1,"title":"Test lunch","amount":12.5,...}

# GET expenses
curl "http://localhost:3000/api/expenses?limit=5"
# Expected: {"expenses":[...],"total":1,"page":1,"pageCount":1}

kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/expenses/
git commit -m "feat: expenses API routes"
```

---

### Task 7: Stats API route

**Files:**
- Create: `src/app/api/stats/route.ts`

- [ ] **Step 1: Create stats route**

Create `src/app/api/stats/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)

    const [year, mon] = month.split('-').map(Number)
    const startOfMonth = new Date(year, mon - 1, 1)
    const endOfMonth   = new Date(year, mon, 1)

    // Previous month range
    const startOfLastMonth = new Date(year, mon - 2, 1)
    const endOfLastMonth   = new Date(year, mon - 1, 1)

    const [thisMonthAgg, lastMonthAgg, totalAgg, budgets] = await Promise.all([
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startOfLastMonth, lt: endOfLastMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      prisma.budget.findMany({
        where: { month },
        include: { category: true },
      }),
    ])

    const thisMonth  = Number(thisMonthAgg._sum.amount ?? 0)
    const lastMonth  = Number(lastMonthAgg._sum.amount ?? 0)
    const totalSpent = Number(totalAgg._sum.amount ?? 0)

    // Calculate remaining budget from categories with limits this month
    let remainingBudget = 0
    if (budgets.length > 0) {
      const categorySpend = await prisma.expense.groupBy({
        by: ['categoryId'],
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { amount: true },
      })
      const spendMap = Object.fromEntries(
        categorySpend.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)])
      )
      remainingBudget = budgets.reduce((acc, b) => {
        const limit = Number(b.limit)
        const spent = spendMap[b.categoryId] ?? 0
        return acc + Math.max(0, limit - spent)
      }, 0)
    }

    // Total budget (sum of all limits this month)
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.limit), 0)

    // Saved = remaining budget (categories where under limit)
    const saved = remainingBudget

    const thisMonthVsLast =
      lastMonth === 0
        ? 0
        : Math.round(((thisMonth - lastMonth) / lastMonth) * 100)

    return NextResponse.json({
      totalSpent,
      remainingBudget,
      totalBudget,
      thisMonth,
      lastMonth,
      saved,
      thisMonthVsLast,   // positive = more spending this month
      month,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test**

```bash
npm run dev &
sleep 3
curl "http://localhost:3000/api/stats?month=2026-04"
# Expected: {"totalSpent":12.5,"remainingBudget":0,"thisMonth":12.5,...}
kill %1
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stats/
git commit -m "feat: stats API route"
```

---

### Task 8: Analytics API route

**Files:**
- Create: `src/app/api/analytics/route.ts`

- [ ] **Step 1: Create analytics route**

Create `src/app/api/analytics/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)

    const [year, mon] = month.split('-').map(Number)
    const startOfMonth    = new Date(year, mon - 1, 1)
    const endOfMonth      = new Date(year, mon, 1)
    const twelveMonthsAgo = new Date(year, mon - 13, 1)

    // Monthly totals for last 12 months (raw SQL for date_trunc grouping)
    const monthlyTotals = await prisma.$queryRaw<
      Array<{ month: string; total: number }>
    >(Prisma.sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
        CAST(SUM(amount) AS FLOAT)                    AS total
      FROM "Expense"
      WHERE date >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date) ASC
    `)

    // Category breakdown for selected month
    const categorySpend = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { date: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { amount: true },
      _count: { id: true },
    })

    // Fetch categories for the breakdown
    const categoryIds = categorySpend.map((s) => s.categoryId)
    const categories  = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

    const categoryBreakdown = categorySpend.map((s) => ({
      categoryId: s.categoryId,
      category:   categoryMap[s.categoryId],
      total:      Number(s._sum.amount ?? 0),
      count:      s._count.id,
    }))

    // Top 10 expenses for selected month
    const topExpenses = await prisma.expense.findMany({
      where: { date: { gte: startOfMonth, lt: endOfMonth } },
      orderBy: { amount: 'desc' },
      take: 10,
      include: { category: true },
    })

    return NextResponse.json({
      monthlyTotals,
      categoryBreakdown,
      topExpenses: topExpenses.map((e) => ({
        ...e,
        amount:    Number(e.amount),
        date:      e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      month,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test**

```bash
npm run dev &
sleep 3
curl "http://localhost:3000/api/analytics?month=2026-04"
# Expected: {"monthlyTotals":[...],"categoryBreakdown":[...],"topExpenses":[...],...}
kill %1
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/analytics/
git commit -m "feat: analytics API route"
```

---

### Task 9: Budget API routes

**Files:**
- Create: `src/app/api/budget/route.ts`
- Create: `src/app/api/budget/[categoryId]/route.ts`

- [ ] **Step 1: Create GET budget route**

Create `src/app/api/budget/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)

    const [year, mon] = month.split('-').map(Number)
    const startOfMonth = new Date(year, mon - 1, 1)
    const endOfMonth   = new Date(year, mon, 1)

    // All categories
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

    // Budget limits for this month
    const budgets = await prisma.budget.findMany({
      where: { month },
      include: { category: true },
    })
    const budgetMap = Object.fromEntries(budgets.map((b) => [b.categoryId, Number(b.limit)]))

    // Actual spending per category this month
    const spending = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { date: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { amount: true },
    })
    const spendMap = Object.fromEntries(
      spending.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)])
    )

    // Merge into BudgetCard data for every category
    const result = categories.map((cat) => ({
      category: cat,
      limit:    budgetMap[cat.id] ?? null,
      spent:    spendMap[cat.id]  ?? 0,
      month,
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create PUT [categoryId] route**

Create `src/app/api/budget/[categoryId]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = parseInt(params.categoryId)
    const body = await request.json()
    const { limit, month } = body

    if (!limit || !month) {
      return NextResponse.json({ error: 'limit and month are required' }, { status: 400 })
    }

    const budget = await prisma.budget.upsert({
      where:  { categoryId_month: { categoryId, month } },
      update: { limit },
      create: { categoryId, limit, month },
      include: { category: true },
    })

    return NextResponse.json({ ...budget, limit: Number(budget.limit) })
  } catch {
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Test**

```bash
npm run dev &
sleep 3

curl "http://localhost:3000/api/budget?month=2026-04"
# Expected: array of objects with category, limit (null), spent

curl -X PUT http://localhost:3000/api/budget/1 \
  -H "Content-Type: application/json" \
  -d '{"limit":500,"month":"2026-04"}'
# Expected: budget object with limit:500

curl "http://localhost:3000/api/budget?month=2026-04"
# Expected: Food now has limit:500

kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/budget/
git commit -m "feat: budget API routes"
```

---

### Task 10: Tailwind config + globals.css

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update Tailwind config**

Replace `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base:    '#0a0a0f',
        card:    '#0f0f18',
        border:  '#1e1e2e',
        muted:   '#13131f',
        accent:  '#7c3aed',
        'accent-light': '#a78bfa',
        'text-primary':   '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted':     '#6b6b80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update globals.css**

Replace `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  body {
    background-color: #0a0a0f;
    color: #f1f5f9;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0f0f18; }
  ::-webkit-scrollbar-thumb { background: #2d2d40; border-radius: 3px; }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: tailwind dark theme config and global styles"
```

---

### Task 11: React Query provider

**Files:**
- Create: `src/app/providers.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create providers component**

Create `src/app/providers.tsx`:

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            30_000,
            refetchOnWindowFocus: true,
            retry:                1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a24',
            border:     '1px solid #2d2d40',
            color:      '#e2e8f0',
          },
        }}
      />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Spendly — Expense Tracker',
  description: 'Track your expenses with style',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex h-screen overflow-hidden bg-base">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create redirect page**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/providers.tsx src/app/layout.tsx src/app/page.tsx
git commit -m "feat: React Query provider and root layout"
```

---

### Task 12: Custom hooks

**Files:**
- Create: `src/lib/hooks/useCategories.ts`
- Create: `src/lib/hooks/useExpenses.ts`
- Create: `src/lib/hooks/useStats.ts`
- Create: `src/lib/hooks/useAnalytics.ts`
- Create: `src/lib/hooks/useBudget.ts`

- [ ] **Step 1: Create useCategories**

Create `src/lib/hooks/useCategories.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type Category = {
  id: number
  name: string
  color: string
  icon: string
  createdAt: string
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  () => fetch('/api/categories').then((r) => r.json()),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: string; icon: string }) =>
      fetch('/api/categories', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created')
    },
    onError: () => toast.error('Failed to create category'),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; color: string; icon: string }) =>
      fetch(`/api/categories/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated')
    },
    onError: () => toast.error('Failed to update category'),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/categories/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Failed to delete category'),
  })
}
```

- [ ] **Step 2: Create useExpenses**

Create `src/lib/hooks/useExpenses.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Category } from './useCategories'

export type Expense = {
  id: number
  title: string
  amount: number
  categoryId: number
  category: Category
  date: string
  note: string | null
  createdAt: string
}

export type ExpensesResponse = {
  expenses:  Expense[]
  total:     number
  page:      number
  pageCount: number
}

export type ExpenseFilters = {
  category?: string
  month?:    string
  search?:   string
  sort?:     'newest' | 'oldest' | 'highest' | 'lowest'
  page?:     number
  limit?:    number
}

function buildParams(filters: ExpenseFilters) {
  const p = new URLSearchParams()
  if (filters.category) p.set('category', filters.category)
  if (filters.month)    p.set('month',    filters.month)
  if (filters.search)   p.set('search',   filters.search)
  if (filters.sort)     p.set('sort',     filters.sort)
  if (filters.page)     p.set('page',     String(filters.page))
  if (filters.limit)    p.set('limit',    String(filters.limit))
  return p.toString()
}

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery<ExpensesResponse>({
    queryKey: ['expenses', filters],
    queryFn:  () =>
      fetch(`/api/expenses?${buildParams(filters)}`).then((r) => r.json()),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      amount: number
      categoryId: number
      date: string
      note?: string
    }) =>
      fetch('/api/expenses', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Expense added')
    },
    onError: () => toast.error('Failed to add expense'),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: number
      title: string
      amount: number
      categoryId: number
      date: string
      note?: string
    }) =>
      fetch(`/api/expenses/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Expense updated')
    },
    onError: () => toast.error('Failed to update expense'),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/expenses/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Expense deleted')
    },
    onError: () => toast.error('Failed to delete expense'),
  })
}
```

- [ ] **Step 3: Create useStats**

Create `src/lib/hooks/useStats.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

export type Stats = {
  totalSpent:       number
  remainingBudget:  number
  totalBudget:      number
  thisMonth:        number
  lastMonth:        number
  saved:            number
  thisMonthVsLast:  number
  month:            string
}

export function useStats(month: string) {
  return useQuery<Stats>({
    queryKey: ['stats', month],
    queryFn:  () => fetch(`/api/stats?month=${month}`).then((r) => r.json()),
  })
}
```

- [ ] **Step 4: Create useAnalytics**

Create `src/lib/hooks/useAnalytics.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import type { Category } from './useCategories'
import type { Expense } from './useExpenses'

export type MonthlyTotal = { month: string; total: number }

export type CategoryBreakdown = {
  categoryId: number
  category:   Category
  total:      number
  count:      number
}

export type AnalyticsData = {
  monthlyTotals:      MonthlyTotal[]
  categoryBreakdown:  CategoryBreakdown[]
  topExpenses:        Expense[]
  month:              string
}

export function useAnalytics(month: string) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', month],
    queryFn:  () => fetch(`/api/analytics?month=${month}`).then((r) => r.json()),
  })
}
```

- [ ] **Step 5: Create useBudget**

Create `src/lib/hooks/useBudget.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Category } from './useCategories'

export type BudgetRow = {
  category: Category
  limit:    number | null
  spent:    number
  month:    string
}

export function useBudget(month: string) {
  return useQuery<BudgetRow[]>({
    queryKey: ['budget', month],
    queryFn:  () => fetch(`/api/budget?month=${month}`).then((r) => r.json()),
  })
}

export function useSetBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      categoryId,
      limit,
      month,
    }: {
      categoryId: number
      limit: number
      month: string
    }) =>
      fetch(`/api/budget/${categoryId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ limit, month }),
      }).then((r) => r.json()),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['budget', variables.month] })
      qc.invalidateQueries({ queryKey: ['stats', variables.month] })
      toast.success('Budget limit saved')
    },
    onError: () => toast.error('Failed to save budget'),
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/
git commit -m "feat: custom React Query hooks"
```

---

### Task 13: UI primitive components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Dialog.tsx`
- Create: `src/components/ui/Select.tsx`

- [ ] **Step 1: Button**

Create `src/components/ui/Button.tsx`:

```tsx
import { forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-accent to-purple-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.5)]',
  ghost:   'bg-muted border border-border text-text-secondary hover:text-text-primary hover:bg-card',
  danger:  'bg-red-900/30 border border-red-800/50 text-red-400 hover:bg-red-900/50',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
```

- [ ] **Step 2: Input**

Create `src/components/ui/Input.tsx`:

```tsx
import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  error?:    string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-lg bg-muted border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
```

- [ ] **Step 3: Badge**

Create `src/components/ui/Badge.tsx`:

```tsx
interface BadgeProps {
  label: string
  color: string   // hex from DB category
}

export function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Card**

Create `src/components/ui/Card.tsx`:

```tsx
import { clsx } from 'clsx'

export function Card({
  children,
  className,
  accentColor,
}: {
  children:      React.ReactNode
  className?:    string
  accentColor?:  string
}) {
  return (
    <div
      className={clsx(
        'relative bg-card border border-border rounded-2xl overflow-hidden',
        className
      )}
    >
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />
      )}
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Dialog**

Create `src/components/ui/Dialog.tsx`:

```tsx
'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface DialogProps {
  open:       boolean
  onOpenChange: (open: boolean) => void
  title:      string
  children:   React.ReactNode
}

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <RadixDialog.Title className="text-base font-semibold text-text-primary">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close className="text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
```

- [ ] **Step 6: Select**

Create `src/components/ui/Select.tsx`:

```tsx
'use client'

import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value:       string
  onValueChange: (value: string) => void
  options:     SelectOption[]
  placeholder?: string
  label?:      string
}

export function Select({ value, onValueChange, options, placeholder = 'Select…', label }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger className="flex items-center justify-between w-full rounded-lg bg-muted border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors">
          <RadixSelect.Value placeholder={placeholder} />
          <ChevronDown size={14} className="text-text-muted" />
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className="z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none',
                    'text-text-secondary hover:text-text-primary hover:bg-muted',
                    'data-[highlighted]:bg-muted data-[highlighted]:text-text-primary'
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check size={12} className="text-accent" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat: UI primitive components"
```

---

### Task 14: Sidebar component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar**

Create `src/components/layout/Sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, BarChart3, Target, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/expenses',  label: 'Expenses',   icon: CreditCard },
  { href: '/analytics', label: 'Analytics',  icon: BarChart3 },
  { href: '/budget',    label: 'Budget',     icon: Target },
]

const SYSTEM = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-700 flex items-center justify-center text-white text-base font-bold">
          S
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary leading-tight">Spendly</p>
          <p className="text-[10px] text-text-muted">Expense Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-2 mb-1">
          Main
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-accent/10 text-accent-light font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-muted'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}

        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-2 mt-4 mb-1">
          System
        </p>
        {SYSTEM.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-accent/10 text-accent-light font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-muted'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent-light">
            Y
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary">Hemanth</p>
            <p className="text-[10px] text-text-muted">Personal account</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Run dev and verify sidebar renders**

```bash
npm run dev
```

Open `http://localhost:3000` — should redirect to `/dashboard` and show the dark sidebar. No content yet on the right. Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: sidebar navigation component"
```

---

### Task 15: Dashboard — StatsCards

**Files:**
- Create: `src/components/dashboard/StatsCards.tsx`

- [ ] **Step 1: Create StatsCards**

Create `src/components/dashboard/StatsCards.tsx`:

```tsx
'use client'

import { TrendingUp, TrendingDown, Wallet, PiggyBank, CalendarDays, Sparkles } from 'lucide-react'
import { useStats } from '@/lib/hooks/useStats'
import { Card } from '@/components/ui/Card'

function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  accentColor,
}: {
  label:        string
  value:        string
  change?:      number
  changeLabel?: string
  icon:         React.ElementType
  accentColor:  string
}) {
  const isUp = (change ?? 0) >= 0

  return (
    <Card accentColor={accentColor}>
      <div className="p-5">
        <div
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}22` }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
        <p className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-text-primary tracking-tight mb-1.5">{value}</p>
        {changeLabel && (
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: isUp ? '#34d399' : '#f87171' }}
          >
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {changeLabel}
          </p>
        )}
      </div>
    </Card>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function StatsCards({ month }: { month: string }) {
  const { data, isLoading } = useStats(month)

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-5 animate-pulse">
              <div className="h-3 bg-border rounded w-20 mb-3" />
              <div className="h-7 bg-border rounded w-28 mb-2" />
              <div className="h-3 bg-border rounded w-24" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Total Spent"
        value={fmt(data.totalSpent)}
        icon={Wallet}
        accentColor="#7c3aed"
      />
      <StatCard
        label="Remaining Budget"
        value={fmt(data.remainingBudget)}
        change={data.remainingBudget}
        changeLabel={
          data.totalBudget > 0
            ? `${Math.round((data.remainingBudget / data.totalBudget) * 100)}% of budget left`
            : 'No budget set'
        }
        icon={PiggyBank}
        accentColor="#10b981"
      />
      <StatCard
        label="This Month"
        value={fmt(data.thisMonth)}
        change={-data.thisMonthVsLast}
        changeLabel={
          data.thisMonthVsLast === 0
            ? 'Same as last month'
            : `${Math.abs(data.thisMonthVsLast)}% ${data.thisMonthVsLast > 0 ? 'more' : 'less'} than last month`
        }
        icon={CalendarDays}
        accentColor="#3b82f6"
      />
      <StatCard
        label="Saved"
        value={fmt(data.saved)}
        changeLabel={data.saved > 0 ? 'Under budget — great job!' : 'Set budgets to track savings'}
        change={data.saved}
        icon={Sparkles}
        accentColor="#f59e0b"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/StatsCards.tsx
git commit -m "feat: dashboard StatsCards component"
```

---

### Task 16: Dashboard — SpendingBarChart

**Files:**
- Create: `src/components/dashboard/SpendingBarChart.tsx`

- [ ] **Step 1: Create SpendingBarChart**

Create `src/components/dashboard/SpendingBarChart.tsx`:

```tsx
'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'
import { format, subMonths } from 'date-fns'

const RANGES = ['6M', '1Y', 'All'] as const
type Range = typeof RANGES[number]

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function SpendingBarChart({ month }: { month: string }) {
  const [range, setRange] = useState<Range>('6M')
  const { data, isLoading } = useAnalytics(month)

  const filtered = (() => {
    if (!data) return []
    const all = data.monthlyTotals
    if (range === 'All') return all
    const count = range === '6M' ? 6 : 12
    return all.slice(-count)
  })()

  const chartData = filtered.map((m) => ({
    month: format(new Date(m.month + '-02'), 'MMM'),
    total: m.total,
  }))

  return (
    <Card accentColor="#7c3aed">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Monthly Spending</p>
            <p className="text-xs text-text-muted mt-0.5">Historical overview</p>
          </div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  range === r
                    ? 'bg-accent/20 text-accent-light'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="h-40 animate-pulse bg-border/30 rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-text-muted text-sm">
            No spending data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b6b80', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b6b80', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmt}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a24',
                  border:     '1px solid #2d2d40',
                  borderRadius: '8px',
                  color:      '#e2e8f0',
                  fontSize:   12,
                }}
                formatter={(v: number) => [fmt(v), 'Spent']}
                cursor={{ fill: '#7c3aed11' }}
              />
              <Bar
                dataKey="total"
                fill="url(#barGrad)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9f67fa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/SpendingBarChart.tsx
git commit -m "feat: dashboard SpendingBarChart component"
```

---

### Task 17: Dashboard — CategoryDonut and RecentExpenses

**Files:**
- Create: `src/components/dashboard/CategoryDonut.tsx`
- Create: `src/components/dashboard/RecentExpenses.tsx`

- [ ] **Step 1: Create CategoryDonut**

Create `src/components/dashboard/CategoryDonut.tsx`:

```tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function CategoryDonut({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)

  const breakdown = data?.categoryBreakdown ?? []

  return (
    <Card accentColor="#7c3aed">
      <div className="p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-text-primary">By Category</p>
          <p className="text-xs text-text-muted mt-0.5">This month</p>
        </div>

        {isLoading ? (
          <div className="h-40 animate-pulse bg-border/30 rounded-full mx-auto w-40" />
        ) : breakdown.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-text-muted text-sm">
            No data this month
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="total"
                  nameKey="category.name"
                  innerRadius={45}
                  outerRadius={65}
                  strokeWidth={2}
                  stroke="#0f0f18"
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.category.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background:   '#1a1a24',
                    border:       '1px solid #2d2d40',
                    borderRadius: '8px',
                    color:        '#e2e8f0',
                    fontSize:     12,
                  }}
                  formatter={(v: number, _: unknown, props: { payload?: { category?: { name?: string } } }) => [
                    fmt(v),
                    props.payload?.category?.name ?? '',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col gap-2">
              {breakdown.slice(0, 4).map((item) => (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span className="text-xs text-text-secondary">{item.category.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-text-primary">{fmt(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Create RecentExpenses**

Create `src/components/dashboard/RecentExpenses.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import * as LucideIcons from 'lucide-react'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CreditCard } from 'lucide-react'

function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const iconName = icon
    .split('-')
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[iconName] ?? LucideIcons.Circle) as React.ElementType
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}22` }}
    >
      <Icon size={16} style={{ color }} />
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function RecentExpenses({ month }: { month: string }) {
  const { data, isLoading } = useExpenses({ month, limit: 5, sort: 'newest' })

  return (
    <Card>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text-primary">Recent Expenses</p>
        <Link href="/expenses" className="text-xs text-accent hover:text-accent-light transition-colors">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-border" />
              <div className="flex-1">
                <div className="h-3 bg-border rounded w-32 mb-1.5" />
                <div className="h-2.5 bg-border rounded w-20" />
              </div>
              <div className="h-4 bg-border rounded w-16" />
            </div>
          ))}
        </div>
      ) : data?.expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <CreditCard size={32} className="text-text-muted" />
          <p className="text-sm text-text-muted">No expenses this month</p>
          <Link href="/expenses" className="text-xs text-accent hover:text-accent-light">
            Add your first expense →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {data?.expenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 px-5 py-3.5">
              <CategoryIcon icon={expense.category.icon} color={expense.category.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{expense.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {expense.category.name} · {format(new Date(expense.date), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge label={expense.category.name} color={expense.category.color} />
              <span className="text-sm font-semibold text-red-400 ml-2">
                -{fmt(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/
git commit -m "feat: dashboard CategoryDonut and RecentExpenses components"
```

---

### Task 18: Dashboard page

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

Create `src/app/dashboard/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Download } from 'lucide-react'
import { StatsCards }       from '@/components/dashboard/StatsCards'
import { SpendingBarChart } from '@/components/dashboard/SpendingBarChart'
import { CategoryDonut }    from '@/components/dashboard/CategoryDonut'
import { RecentExpenses }   from '@/components/dashboard/RecentExpenses'
import { ExpenseForm }      from '@/components/expenses/ExpenseForm'
import { Button }           from '@/components/ui/Button'
import { useExpenses }      from '@/lib/hooks/useExpenses'

function currentMonth() {
  return format(new Date(), 'yyyy-MM')
}

export default function DashboardPage() {
  const [month]        = useState(currentMonth)
  const [showForm, setShowForm] = useState(false)
  const { data }       = useExpenses({ month, limit: 1 })

  async function handleExport() {
    const res     = await fetch(`/api/expenses?limit=10000`)
    const json    = await res.json()
    const rows    = json.expenses
    const csv     = [
      'Title,Amount,Category,Date,Note',
      ...rows.map((e: { title: string; amount: number; category: { name: string }; date: string; note: string | null }) =>
        `"${e.title}",${e.amount},"${e.category.name}",${e.date.slice(0, 10)},"${e.note ?? ''}"`
      ),
    ].join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = `expenses-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-border px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {format(new Date(), 'MMMM yyyy')} · {data?.total ?? 0} transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download size={13} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={13} /> Add Expense
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-7 flex flex-col gap-5">
        <StatsCards month={month} />

        <div className="grid grid-cols-[2fr_1fr] gap-5">
          <SpendingBarChart month={month} />
          <CategoryDonut month={month} />
        </div>

        <RecentExpenses month={month} />
      </div>

      <ExpenseForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/
git commit -m "feat: dashboard page"
```

---

### Task 19: Expenses — FiltersBar and ExpenseForm

**Files:**
- Create: `src/components/expenses/FiltersBar.tsx`
- Create: `src/components/expenses/ExpenseForm.tsx`

- [ ] **Step 1: Create FiltersBar**

Create `src/components/expenses/FiltersBar.tsx`:

```tsx
'use client'

import { Search, X } from 'lucide-react'
import { useCategories } from '@/lib/hooks/useCategories'
import { Select } from '@/components/ui/Select'
import { format, subMonths } from 'date-fns'

export type Filters = {
  search:   string
  category: string
  month:    string
  sort:     string
}

interface FiltersBarProps {
  filters:   Filters
  onChange:  (filters: Filters) => void
}

function buildMonthOptions() {
  const opts = []
  for (let i = 0; i < 13; i++) {
    const d   = subMonths(new Date(), i)
    const val = format(d, 'yyyy-MM')
    const lbl = format(d, 'MMMM yyyy')
    opts.push({ value: val, label: lbl })
  }
  return opts
}

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest',  label: 'Lowest amount' },
]

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const { data: categories = [] } = useCategories()

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: c.name, label: c.name })),
  ]

  const monthOptions  = buildMonthOptions()
  const hasFilters    = filters.search || filters.category || filters.sort !== 'newest'

  function set(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search expenses…"
          className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Category */}
      <div className="w-44">
        <Select
          value={filters.category}
          onValueChange={(v) => set('category', v)}
          options={categoryOptions}
          placeholder="All categories"
        />
      </div>

      {/* Month */}
      <div className="w-40">
        <Select
          value={filters.month}
          onValueChange={(v) => set('month', v)}
          options={monthOptions}
          placeholder="This month"
        />
      </div>

      {/* Sort */}
      <div className="w-40">
        <Select
          value={filters.sort}
          onValueChange={(v) => set('sort', v)}
          options={SORT_OPTIONS}
          placeholder="Sort"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => onChange({ search: '', category: '', month: format(new Date(), 'yyyy-MM'), sort: 'newest' })}
          className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ExpenseForm**

Create `src/components/expenses/ExpenseForm.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog }    from '@/components/ui/Dialog'
import { Input }     from '@/components/ui/Input'
import { Button }    from '@/components/ui/Button'
import { Select }    from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useUpdateExpense, type Expense } from '@/lib/hooks/useExpenses'

interface ExpenseFormProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  expense?:     Expense   // if provided, we're editing
}

const EMPTY = { title: '', amount: '', categoryId: '', date: format(new Date(), 'yyyy-MM-dd'), note: '' }

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: categories = [] } = useCategories()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  useEffect(() => {
    if (expense) {
      setForm({
        title:      expense.title,
        amount:     String(expense.amount),
        categoryId: String(expense.categoryId),
        date:       expense.date.slice(0, 10),
        note:       expense.note ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [expense, open])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim())       e.title      = 'Title is required'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
                                  e.amount     = 'Valid amount required'
    if (!form.categoryId)         e.categoryId = 'Category is required'
    if (!form.date)               e.date       = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      title:      form.title.trim(),
      amount:     Number(form.amount),
      categoryId: Number(form.categoryId),
      date:       form.date,
      note:       form.note.trim() || undefined,
    }

    if (expense) {
      await updateMutation.mutateAsync({ id: expense.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }))
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={expense ? 'Edit Expense' : 'Add Expense'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="e.g. Lunch at Chipotle"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
        />
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          error={errors.amount}
        />
        <Select
          label="Category"
          value={form.categoryId}
          onValueChange={(v) => setForm({ ...form, categoryId: v })}
          options={categoryOptions}
          placeholder="Select category…"
        />
        {errors.categoryId && <p className="text-xs text-red-400 -mt-2">{errors.categoryId}</p>}
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          error={errors.date}
        />
        <Input
          label="Note (optional)"
          placeholder="Any additional details…"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : expense ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/expenses/FiltersBar.tsx src/components/expenses/ExpenseForm.tsx
git commit -m "feat: FiltersBar and ExpenseForm components"
```

---

### Task 20: Expenses — ExpenseTable and page

**Files:**
- Create: `src/components/expenses/ExpenseTable.tsx`
- Create: `src/app/expenses/page.tsx`

- [ ] **Step 1: Create ExpenseTable**

Create `src/components/expenses/ExpenseTable.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useExpenses, useDeleteExpense, type Expense, type ExpenseFilters } from '@/lib/hooks/useExpenses'
import { Badge }        from '@/components/ui/Badge'
import { Card }         from '@/components/ui/Card'
import { Button }       from '@/components/ui/Button'
import { Dialog }       from '@/components/ui/Dialog'
import { ExpenseForm }  from './ExpenseForm'

function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const iconName = icon
    .split('-')
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[iconName] ?? LucideIcons.Circle) as React.ElementType
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}22` }}
    >
      <Icon size={15} style={{ color }} />
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function ExpenseTable({ filters }: { filters: ExpenseFilters }) {
  const [page,        setPage]        = useState(1)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [deleteTarget,setDeleteTarget]= useState<Expense | null>(null)

  const { data, isLoading } = useExpenses({ ...filters, page, limit: 10 })
  const deleteMutation      = useDeleteExpense()

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (isLoading) {
    return (
      <Card>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-border" />
              <div className="flex-1">
                <div className="h-3 bg-border rounded w-40 mb-2" />
                <div className="h-2.5 bg-border rounded w-24" />
              </div>
              <div className="h-4 bg-border rounded w-20" />
              <div className="h-4 bg-border rounded w-16" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (!data || data.expenses.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-text-muted gap-2">
          <p className="text-sm">No expenses found</p>
          <p className="text-xs">Try adjusting your filters</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        {/* Table head */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] px-5 py-3 border-b border-border">
          {['Description', 'Category', 'Date', 'Amount', ''].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-text-muted uppercase tracking-wider last:text-right">
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {data.expenses.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] px-5 py-3.5 items-center hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon icon={expense.category.icon} color={expense.category.color} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{expense.title}</p>
                  {expense.note && (
                    <p className="text-xs text-text-muted truncate">{expense.note}</p>
                  )}
                </div>
              </div>
              <Badge label={expense.category.name} color={expense.category.color} />
              <p className="text-sm text-text-secondary">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </p>
              <p className="text-sm font-semibold text-red-400">{fmt(expense.amount)}</p>
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setEditExpense(expense)}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-muted transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setDeleteTarget(expense)}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-800/50 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data.pageCount > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <p className="text-xs text-text-muted">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of {data.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs transition-colors ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'border border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.pageCount, p + 1))}
                disabled={page === data.pageCount}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit dialog */}
      <ExpenseForm
        open={!!editExpense}
        onOpenChange={(o) => { if (!o) setEditExpense(null) }}
        expense={editExpense ?? undefined}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }} title="Delete Expense">
        <p className="text-sm text-text-secondary mb-5">
          Are you sure you want to delete <span className="text-text-primary font-medium">{deleteTarget?.title}</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Create expenses page**

Create `src/app/expenses/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { FiltersBar, type Filters } from '@/components/expenses/FiltersBar'
import { ExpenseTable }             from '@/components/expenses/ExpenseTable'
import { ExpenseForm }              from '@/components/expenses/ExpenseForm'
import { Button }                   from '@/components/ui/Button'
import { useExpenses }              from '@/lib/hooks/useExpenses'

const DEFAULT_FILTERS: Filters = {
  search:   '',
  category: '',
  month:    format(new Date(), 'yyyy-MM'),
  sort:     'newest',
}

export default function ExpensesPage() {
  const [filters,  setFilters]  = useState<Filters>(DEFAULT_FILTERS)
  const [showForm, setShowForm] = useState(false)

  const { data } = useExpenses({ month: filters.month, limit: 1 })

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-border px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Expenses</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {data?.total ?? 0} transactions · {format(new Date(filters.month + '-02'), 'MMMM yyyy')}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={13} /> Add Expense
        </Button>
      </div>

      <div className="flex-1 p-7 flex flex-col gap-5">
        <FiltersBar filters={filters} onChange={setFilters} />
        <ExpenseTable filters={filters} />
      </div>

      <ExpenseForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
```

- [ ] **Step 3: Test expenses flow**

```bash
npm run dev
```

Navigate to `http://localhost:3000/expenses`. Add a few expenses using the form. Verify they appear in the table. Edit one. Delete one. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/expenses/ExpenseTable.tsx src/app/expenses/
git commit -m "feat: expenses page with full CRUD table"
```

---

### Task 21: Analytics page

**Files:**
- Create: `src/components/analytics/MonthlyTrendChart.tsx`
- Create: `src/components/analytics/CategoryPieChart.tsx`
- Create: `src/components/analytics/TopSpendingTable.tsx`
- Create: `src/app/analytics/page.tsx`

- [ ] **Step 1: Create MonthlyTrendChart**

Create `src/components/analytics/MonthlyTrendChart.tsx`:

```tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'

function fmt(n: number) { return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}` }

export function MonthlyTrendChart({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)

  const chartData = (data?.monthlyTotals ?? []).map((m) => ({
    month: format(new Date(m.month + '-02'), 'MMM yy'),
    total: m.total,
  }))

  return (
    <Card accentColor="#7c3aed">
      <div className="p-5">
        <p className="text-sm font-semibold text-text-primary mb-1">12-Month Trend</p>
        <p className="text-xs text-text-muted mb-4">Your spending over the last 12 months</p>
        {isLoading ? (
          <div className="h-52 animate-pulse bg-border/30 rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-text-muted text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b6b80', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid #2d2d40', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
                formatter={(v: number) => [fmt(v), 'Spent']}
                cursor={{ stroke: '#7c3aed44', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#a78bfa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Create CategoryPieChart**

Create `src/components/analytics/CategoryPieChart.tsx`:

```tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function CategoryPieChart({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)
  const breakdown = data?.categoryBreakdown ?? []

  return (
    <Card accentColor="#10b981">
      <div className="p-5">
        <p className="text-sm font-semibold text-text-primary mb-1">Spending by Category</p>
        <p className="text-xs text-text-muted mb-4">Breakdown for selected month</p>
        {isLoading ? (
          <div className="h-64 animate-pulse bg-border/30 rounded-full mx-auto w-64" />
        ) : breakdown.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">No data this month</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="total"
                nameKey="category.name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
                stroke="#0f0f18"
              >
                {breakdown.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.category.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid #2d2d40', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
                formatter={(v: number, _: unknown, props: { payload?: { category?: { name?: string } } }) => [fmt(v), props.payload?.category?.name ?? '']}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: Create TopSpendingTable**

Create `src/components/analytics/TopSpendingTable.tsx`:

```tsx
'use client'

import { format } from 'date-fns'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function TopSpendingTable({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)

  return (
    <Card>
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text-primary">Top Expenses</p>
        <p className="text-xs text-text-muted mt-0.5">Highest single transactions this month</p>
      </div>
      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
              <div className="w-6 h-6 bg-border rounded" />
              <div className="flex-1 h-3 bg-border rounded w-32" />
              <div className="h-3 bg-border rounded w-16" />
            </div>
          ))}
        </div>
      ) : !data?.topExpenses.length ? (
        <div className="flex items-center justify-center py-12 text-text-muted text-sm">
          No expenses this month
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {data.topExpenses.map((expense, idx) => (
            <div key={expense.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="text-xs font-bold text-text-muted w-5 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{expense.title}</p>
                <p className="text-xs text-text-muted">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
              </div>
              <Badge label={expense.category.name} color={expense.category.color} />
              <span className="text-sm font-semibold text-red-400 ml-2">{fmt(expense.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 4: Create analytics page**

Create `src/app/analytics/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { format, subMonths } from 'date-fns'
import { Select }              from '@/components/ui/Select'
import { MonthlyTrendChart }   from '@/components/analytics/MonthlyTrendChart'
import { CategoryPieChart }    from '@/components/analytics/CategoryPieChart'
import { TopSpendingTable }    from '@/components/analytics/TopSpendingTable'

function buildMonthOptions() {
  return Array.from({ length: 13 }, (_, i) => {
    const d = subMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

export default function AnalyticsPage() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const monthOptions      = buildMonthOptions()

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-border px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Analytics</h1>
          <p className="text-xs text-text-muted mt-0.5">Detailed spending insights</p>
        </div>
        <div className="w-44">
          <Select value={month} onValueChange={setMonth} options={monthOptions} />
        </div>
      </div>

      <div className="flex-1 p-7 flex flex-col gap-5">
        <MonthlyTrendChart month={month} />
        <div className="grid grid-cols-2 gap-5">
          <CategoryPieChart month={month} />
          <TopSpendingTable month={month} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/analytics/ src/app/analytics/
git commit -m "feat: analytics page with trend, pie chart, top spending"
```

---

### Task 22: Budget page

**Files:**
- Create: `src/components/budget/BudgetCard.tsx`
- Create: `src/components/budget/BudgetEditDialog.tsx`
- Create: `src/app/budget/page.tsx`

- [ ] **Step 1: Create BudgetEditDialog**

Create `src/components/budget/BudgetEditDialog.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog }      from '@/components/ui/Dialog'
import { Input }       from '@/components/ui/Input'
import { Button }      from '@/components/ui/Button'
import { useSetBudget } from '@/lib/hooks/useBudget'
import type { BudgetRow } from '@/lib/hooks/useBudget'

interface BudgetEditDialogProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  row:          BudgetRow | null
}

export function BudgetEditDialog({ open, onOpenChange, row }: BudgetEditDialogProps) {
  const [limit, setLimit] = useState('')
  const mutation          = useSetBudget()

  useEffect(() => {
    setLimit(row?.limit != null ? String(row.limit) : '')
  }, [row, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!row || !limit || isNaN(Number(limit)) || Number(limit) <= 0) return
    await mutation.mutateAsync({
      categoryId: row.category.id,
      limit:      Number(limit),
      month:      row.month,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Set Budget — ${row?.category.name ?? ''}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          Set a monthly spending limit for <span className="text-text-primary font-medium">{row?.category.name}</span>.
          You've spent <span className="text-red-400 font-medium">${row?.spent.toFixed(2) ?? '0'}</span> this month.
        </p>
        <Input
          label="Monthly limit ($)"
          type="number"
          step="1"
          min="1"
          placeholder="500"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Limit'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create BudgetCard**

Create `src/components/budget/BudgetCard.tsx`:

```tsx
'use client'

import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card }   from '@/components/ui/Card'
import type { BudgetRow } from '@/lib/hooks/useBudget'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function BudgetCard({
  row,
  onEdit,
}: {
  row:    BudgetRow
  onEdit: (row: BudgetRow) => void
}) {
  const { category, limit, spent } = row
  const hasLimit  = limit != null
  const pct       = hasLimit ? Math.min(100, (spent / limit!) * 100) : 0
  const remaining = hasLimit ? Math.max(0, limit! - spent) : 0

  const barColor =
    pct >= 90 ? '#ef4444' :
    pct >= 70 ? '#f59e0b' :
    '#10b981'

  const iconName = category.icon
    .split('-')
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[iconName] ?? LucideIcons.Circle) as React.ElementType

  return (
    <Card accentColor={category.color}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${category.color}22` }}
            >
              <Icon size={18} style={{ color: category.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{category.name}</p>
              <p className="text-xs text-text-muted">
                {hasLimit ? `Limit: ${fmt(limit!)}` : 'No limit set'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
            {hasLimit ? 'Edit' : 'Set Limit'}
          </Button>
        </div>

        {hasLimit ? (
          <>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-muted">Spent</span>
              <span style={{ color: barColor }} className="font-medium">
                {fmt(spent)} / {fmt(limit!)}
              </span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-text-muted">{pct.toFixed(0)}% used</span>
              <span className="text-text-secondary">{fmt(remaining)} left</span>
            </div>
          </>
        ) : (
          <div className="mt-2">
            <p className="text-xs text-text-muted">
              Spent so far: <span className="text-text-primary font-medium">{fmt(spent)}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: Create budget page**

Create `src/app/budget/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { format, subMonths } from 'date-fns'
import { useBudget, type BudgetRow } from '@/lib/hooks/useBudget'
import { BudgetCard }        from '@/components/budget/BudgetCard'
import { BudgetEditDialog }  from '@/components/budget/BudgetEditDialog'
import { Select }            from '@/components/ui/Select'
import { Card }              from '@/components/ui/Card'

function buildMonthOptions() {
  return Array.from({ length: 13 }, (_, i) => {
    const d = subMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

export default function BudgetPage() {
  const [month,   setMonth]   = useState(format(new Date(), 'yyyy-MM'))
  const [editRow, setEditRow] = useState<BudgetRow | null>(null)

  const { data: rows = [], isLoading } = useBudget(month)
  const monthOptions = buildMonthOptions()

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-border px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Budget</h1>
          <p className="text-xs text-text-muted mt-0.5">Set and track category spending limits</p>
        </div>
        <div className="w-44">
          <Select value={month} onValueChange={setMonth} options={monthOptions} />
        </div>
      </div>

      <div className="flex-1 p-7">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div className="p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-border" />
                    <div className="flex-1">
                      <div className="h-3 bg-border rounded w-20 mb-2" />
                      <div className="h-2.5 bg-border rounded w-28" />
                    </div>
                  </div>
                  <div className="h-2 bg-border rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {rows.map((row) => (
              <BudgetCard key={row.category.id} row={row} onEdit={setEditRow} />
            ))}
          </div>
        )}
      </div>

      <BudgetEditDialog
        open={!!editRow}
        onOpenChange={(o) => { if (!o) setEditRow(null) }}
        row={editRow}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/budget/ src/app/budget/
git commit -m "feat: budget page with per-category progress cards"
```

---

### Task 23: Settings page

**Files:**
- Create: `src/components/settings/CategoryManager.tsx`
- Create: `src/components/settings/PreferencesForm.tsx`
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: Create CategoryManager**

Create `src/components/settings/CategoryManager.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from '@/lib/hooks/useCategories'
import { Input }  from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card }   from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'

const ICON_OPTIONS = [
  'utensils','car','home','tv','heart-pulse','shopping-bag',
  'more-horizontal','coffee','plane','zap','music','book',
  'dumbbell','gamepad-2','briefcase','gift',
]

const COLOR_OPTIONS = [
  '#7c3aed','#10b981','#6366f1','#ec4899','#f59e0b',
  '#3b82f6','#6b7280','#ef4444','#06b6d4','#84cc16',
]

function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const iconName = icon
    .split('-')
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[iconName] ?? LucideIcons.Circle) as React.ElementType
  return <Icon size={16} style={{ color }} />
}

interface FormState { name: string; color: string; icon: string }
const EMPTY_FORM: FormState = { name: '', color: '#7c3aed', icon: 'utensils' }

function CategoryFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
  title,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  initial: FormState
  onSubmit: (f: FormState) => void
  isPending: boolean
  title: string
}) {
  const [form, setForm] = useState<FormState>(initial)

  // Reset when dialog opens
  useState(() => { setForm(initial) })

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Groceries"
        />

        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? '#fff' : 'transparent',
                  transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Icon</p>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map((ic) => {
              const iconName = ic.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons
              const Icon = (LucideIcons[iconName] ?? LucideIcons.Circle) as React.ElementType
              return (
                <button
                  key={ic}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all"
                  style={{
                    borderColor:     form.icon === ic ? form.color : '#1e1e2e',
                    backgroundColor: form.icon === ic ? `${form.color}22` : 'transparent',
                    color:           form.icon === ic ? form.color : '#6b6b80',
                  }}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={isPending || !form.name.trim()}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function CategoryManager() {
  const { data: categories = [], isLoading } = useCategories()
  const createMutation  = useCreateCategory()
  const updateMutation  = useUpdateCategory()
  const deleteMutation  = useDeleteCategory()

  const [showCreate, setShowCreate]   = useState(false)
  const [editCat,    setEditCat]      = useState<Category | null>(null)
  const [deleteCat,  setDeleteCat]    = useState<Category | null>(null)

  return (
    <Card>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-text-primary">Categories</p>
          <p className="text-xs text-text-muted mt-0.5">Manage your expense categories</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={13} /> Add Category
        </Button>
      </div>

      <div className="divide-y divide-border/50">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-border" />
              <div className="h-3 bg-border rounded w-24 flex-1" />
            </div>
          ))
        ) : categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-5 py-3.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${cat.color}22` }}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} />
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <p className="text-sm font-medium text-text-primary flex-1">{cat.name}</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditCat(cat)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-muted transition-colors"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setDeleteCat(cat)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-800/50 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create dialog */}
      <CategoryFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        initial={EMPTY_FORM}
        isPending={createMutation.isPending}
        title="New Category"
        onSubmit={async (f) => {
          await createMutation.mutateAsync(f)
          setShowCreate(false)
        }}
      />

      {/* Edit dialog */}
      {editCat && (
        <CategoryFormDialog
          open={!!editCat}
          onOpenChange={(o) => { if (!o) setEditCat(null) }}
          initial={{ name: editCat.name, color: editCat.color, icon: editCat.icon }}
          isPending={updateMutation.isPending}
          title="Edit Category"
          onSubmit={async (f) => {
            await updateMutation.mutateAsync({ id: editCat.id, ...f })
            setEditCat(null)
          }}
        />
      )}

      {/* Delete confirm */}
      <Dialog
        open={!!deleteCat}
        onOpenChange={(o) => { if (!o) setDeleteCat(null) }}
        title="Delete Category"
      >
        <p className="text-sm text-text-secondary mb-5">
          Delete <span className="text-text-primary font-medium">{deleteCat?.name}</span>? This will fail if any expenses use this category.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteCat(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!deleteCat) return
              await deleteMutation.mutateAsync(deleteCat.id)
              setDeleteCat(null)
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </Card>
  )
}
```

- [ ] **Step 2: Create PreferencesForm**

Create `src/components/settings/PreferencesForm.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { toast }   from 'sonner'
import { Input }   from '@/components/ui/Input'
import { Select }  from '@/components/ui/Select'
import { Button }  from '@/components/ui/Button'
import { Card }    from '@/components/ui/Card'

const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
]

export function PreferencesForm() {
  const [currency,   setCurrency]   = useState('$')
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy')

  useEffect(() => {
    setCurrency(localStorage.getItem('pref_currency')   ?? '$')
    setDateFormat(localStorage.getItem('pref_dateFormat') ?? 'MM/dd/yyyy')
  }, [])

  function save() {
    localStorage.setItem('pref_currency',   currency)
    localStorage.setItem('pref_dateFormat', dateFormat)
    toast.success('Preferences saved')
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text-primary">Preferences</p>
        <p className="text-xs text-text-muted mt-0.5">Display settings (saved locally)</p>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <Input
          label="Currency symbol"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="$"
        />
        <Select
          label="Date format"
          value={dateFormat}
          onValueChange={setDateFormat}
          options={DATE_FORMATS}
        />
        <div className="flex justify-end">
          <Button onClick={save}>Save Preferences</Button>
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: Create settings page**

Create `src/app/settings/page.tsx`:

```tsx
import { CategoryManager } from '@/components/settings/CategoryManager'
import { PreferencesForm } from '@/components/settings/PreferencesForm'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-border px-7 py-4">
        <h1 className="text-lg font-bold text-text-primary tracking-tight">Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">Manage categories and preferences</p>
      </div>
      <div className="flex-1 p-7 flex flex-col gap-5 max-w-2xl">
        <CategoryManager />
        <PreferencesForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/ src/app/settings/
git commit -m "feat: settings page with category manager and preferences"
```

---

### Task 24: Final verification

- [ ] **Step 1: Run full dev build**

```bash
npm run dev
```

- [ ] **Step 2: Verify each page**

Open `http://localhost:3000` and check each page:

1. **Dashboard** — stats cards show live data, bar chart renders, donut renders, recent expenses list works, "Add Expense" button opens form
2. **Expenses** — table loads from DB, search filters work, category filter populates from DB, add/edit/delete all work with optimistic updates
3. **Analytics** — month picker changes data, line chart shows 12-month trend, pie chart shows category breakdown from DB, top expenses table shows real data
4. **Budget** — all categories shown (from DB, not hardcoded), set limit saves to DB, progress bar updates on return visit, edit works
5. **Settings** — add new category → appears everywhere (sidebar filter, expense form, budget page), edit/delete work

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: build completes without errors. Fix any type errors reported before continuing.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete expenses tracker rebuild — dark premium UI, PostgreSQL, React Query"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered |
|---|---|
| Dark & Premium theme | ✅ Tailwind config + globals.css (Task 10) |
| Expanded sidebar | ✅ Sidebar.tsx (Task 14) |
| Dashboard page | ✅ Tasks 15-18 |
| Expenses page with full CRUD | ✅ Tasks 19-20 |
| Analytics page | ✅ Task 21 |
| Budget page | ✅ Task 22 |
| Settings with category management | ✅ Task 23 |
| PostgreSQL + Prisma | ✅ Tasks 3-4 |
| React Query (real-time, optimistic) | ✅ Tasks 11-12 |
| Zero hardcoded data | ✅ All hooks fetch from DB; categories drive charts/badges/filters dynamically |
| Empty states | ✅ Each component renders an empty state when data is absent |
| Toast notifications | ✅ Sonner via Providers (Task 11), called in every mutation |
| Export CSV | ✅ Dashboard handleExport (Task 18) |
| Dynamic category colors in charts | ✅ CategoryDonut + CategoryPieChart use `entry.category.color` from DB |
