// AFTER
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetching and idle timeout in serverless environments
const client = postgres(connectionString, { prepare: false });

// This uses the postgres-js driver that DOES support transactions
export const db = drizzle(client, { schema });