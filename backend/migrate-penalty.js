import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE tourists ADD COLUMN IF NOT EXISTS "adminManualPenalty" double precision NOT NULL DEFAULT 0;`;
    console.log("Migration successful: Added adminManualPenalty");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}

run();
