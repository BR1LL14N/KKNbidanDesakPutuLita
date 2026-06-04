import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from '../prisma/prisma.config';
import * as dotenv from 'dotenv';
dotenv.config();   // <-- ini penting


const prismaClientSingleton = () => {
  let host = 'localhost';
  let port = 3306;
  let user = 'root';
  let password = '';
  let database = 'db_kkn_bidan';

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      host = url.hostname || 'localhost';
      port = url.port ? parseInt(url.port) : 3306;
      user = url.username || 'root';
      password = url.password ? decodeURIComponent(url.password) : '';
      database = url.pathname.replace(/^\//, '') || 'db_kkn_bidan';
    } catch (err) {
      console.warn('Warning: Invalid DATABASE_URL format in environment. Using default local MySQL credentials.', err);
    }
  } else {
    console.warn('Warning: DATABASE_URL is not set. Using default local MySQL credentials.');
  }

// Create Prisma client using adapter defined in prisma.config.ts
try {
  return new PrismaClient({ adapter: prismaAdapter });
} catch (err) {
  console.error('Critical Error creating Prisma client:', err);
  process.exit(1);
}
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
