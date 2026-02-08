// lib/prisma.ts
import { PrismaClient } from '@prisma-generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Prisma 7.3.0 Singleton Pattern
 * This ensures we don't exhaust database connections during Next.js hot-reloading.
 */

const prismaClientSingleton = () => {
    // 1. Initialize the connection pool using the native 'pg' driver
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });

    // 2. Wrap the pool in the Prisma PostgreSQL adapter
    const adapter = new PrismaPg(pool);

    // 3. Return a new instance of the Rust-free TypeScript client
    return new PrismaClient({ adapter });
};

// Define the global type to prevent TS errors on globalThis
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

// Use the existing instance or create a new one
// We export this as 'client' so your import { client } from '@/lib/prisma' works
export const client = globalForPrisma.prisma ?? prismaClientSingleton();

// If we are not in production, save the instance to globalThis
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
}

// Also providing a default export for flexibility
export default client;