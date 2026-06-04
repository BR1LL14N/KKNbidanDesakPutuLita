import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const dbUrl = process.env.DATABASE_URL;
let host = 'localhost';
let port = 3306;
let user = 'root';
let password = '';
let database = 'db_kkn_bidan';

if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    host = url.hostname || 'localhost';
    port = url.port ? parseInt(url.port) : 3306;
    user = url.username || 'root';
    password = url.password ? decodeURIComponent(url.password) : '';
    database = url.pathname.replace(/^\//, '') || 'db_kkn_bidan';
  } catch (err) {
    console.warn('Warning: Invalid DATABASE_URL format in environment. Using default MySQL credentials.', err);
  }
} else {
  console.warn('Warning: DATABASE_URL is not set. Using default MySQL credentials.');
}

export const prismaAdapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5,
});
