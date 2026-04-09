import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

async function main() {
  const defaults = [
    { name: 'Food',          color: '#8b5cf6', icon: 'utensils' },
    { name: 'Transport',     color: '#10b981', icon: 'car' },
    { name: 'Housing',       color: '#6366f1', icon: 'home' },
    { name: 'Entertainment', color: '#ec4899', icon: 'tv' },
    { name: 'Health',        color: '#f59e0b', icon: 'heart-pulse' },
    { name: 'Shopping',      color: '#3b82f6', icon: 'shopping-bag' },
    { name: 'Other',         color: '#6b7280', icon: 'more-horizontal' },
  ]

  for (const cat of defaults) {
    await prisma.category.upsert({
      where:  { name: cat.name },
      update: {},
      create: cat,
    })
  }
  console.log('Seeded default categories.')

  await prisma.user.upsert({
    where:  { email: 'admin@spendly.com' },
    update: {},
    create: {
      firstName:    'Admin',
      lastName:     'User',
      username:     'admin',
      email:        'admin@spendly.com',
      phone:        null,
      passwordHash: await bcrypt.hash('Admin@1234', 12),
      role:         'ADMIN',
    },
  })
  console.log('Seeded default admin — admin@spendly.com / Admin@1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
