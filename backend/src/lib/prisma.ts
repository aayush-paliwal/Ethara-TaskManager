import { Pool } from 'pg';
import dotenv from 'dotenv';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';


dotenv.config();

const connectionString = process.env.DATABASE_URL;

const poolConfig: any = { connectionString };

if (connectionString && connectionString.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
