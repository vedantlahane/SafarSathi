import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE tourists RENAME COLUMN "adminManualPenalty" TO "admin_manual_penalty";`;
    console.log("Migration successful: Renamed to admin_manual_penalty");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}

run();
