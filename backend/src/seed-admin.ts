import bcrypt from 'bcryptjs';
import { db } from './shared/db/client.js';
import { policeDepartments } from './shared/db/schema.js';
import { sql, eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log("Seeding admin...");
    const email = "admin@yatrax.dev";
    const password = "Admin@1234";
    const hash = await bcrypt.hash(password, 12);
    
    const existing = await db.select().from(policeDepartments).where(eq(policeDepartments.email, email)).limit(1);
    const wkt = `SRID=4326;POINT(91.7362 26.1445)`;

    if (existing.length > 0) {
      await db.update(policeDepartments)
        .set({
          passwordHash: hash,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(policeDepartments.email, email));
      console.log("Updated existing admin!");
    } else {
      await db.insert(policeDepartments).values({
        name: "Guwahati Central",
        email: email,
        passwordHash: hash,
        departmentCode: "GHY001",
        latitude: 26.1445,
        longitude: 91.7362,
        geom: sql`ST_GeogFromText(${wkt})` as any,
        city: "Guwahati",
        district: "Kamrup Metro",
        state: "Assam",
        contactNumber: "+913612345678",
        stationType: "headquarters",
        jurisdictionRadiusKm: 10,
        officerCount: 50,
        isActive: true,
      });
      console.log("Created new admin!");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();
