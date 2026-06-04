import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from '../prisma/prisma.config';
import * as dotenv from 'dotenv';
dotenv.config();   // <-- ini penting


const prismaClientSingleton = () => {
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
