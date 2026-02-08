// prisma.config.ts (at your project root)
import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // This pulls from your .env file
    url: env('DATABASE_URL'),
  },
});