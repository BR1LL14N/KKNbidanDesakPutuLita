import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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

  try {
    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 5,
    });
    return new PrismaClient({ adapter });
  } catch (err) {
    console.error('Critical Error: Failed to instantiate Prisma client with MariaDB adapter:', err);
    // Return empty constructor client as emergency fallback, even if it may fail during execution
    return new PrismaClient();
  }
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
