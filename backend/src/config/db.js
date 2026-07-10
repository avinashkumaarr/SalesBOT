const { PrismaClient } = require('@prisma/client');

if (process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
    console.error('⚠️ [WARNING]: Your DATABASE_URL environment variable is currently pointing to `localhost:5432` inside a cloud deployment (Render/Vercel). Cloud servers cannot reach your laptop\'s local PostgreSQL database. Please update DATABASE_URL in your Render Dashboard -> Environment settings to a cloud PostgreSQL connection string (Render Postgres / Supabase / Neon).');
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
