import bcrypt from 'bcryptjs';
import { db } from './shared/db/client.js';
import { policeDepartments, tourists } from './shared/db/schema.js';
import { sql, eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log("Seeding admin...");
    const adminEmail = "admin@yatrax.dev";
    const adminPassword = "Admin@1234";
    const adminHash = await bcrypt.hash(adminPassword, 12);
    
    const existingAdmin = await db.select().from(policeDepartments).where(eq(policeDepartments.email, adminEmail)).limit(1);
    const wkt = `SRID=4326;POINT(75.5762 31.3260)`;

    if (existingAdmin.length > 0) {
      await db.update(policeDepartments)
        .set({
          passwordHash: adminHash,
          latitude: 31.3260,
          longitude: 75.5762,
          geom: sql`ST_GeogFromText(${wkt})` as any,
          city: "Jalandhar",
          district: "Jalandhar",
          state: "Punjab",
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(policeDepartments.email, adminEmail));
      console.log("Updated existing admin!");
    } else {
      await db.insert(policeDepartments).values({
        name: "Jalandhar Central",
        email: adminEmail,
        passwordHash: adminHash,
        departmentCode: "JAL001",
        latitude: 31.3260,
        longitude: 75.5762,
        geom: sql`ST_GeogFromText(${wkt})` as any,
        city: "Jalandhar",
        district: "Jalandhar",
        state: "Punjab",
        contactNumber: "+911812345678",
        stationType: "headquarters",
        jurisdictionRadiusKm: 10,
        officerCount: 50,
        isActive: true,
      });
      console.log("Created new admin!");
    }

    console.log("Seeding test tourist...");
    const touristEmail = "tourist@yatrax.dev";
    const touristPassword = "Tourist@1234";
    const touristHash = await bcrypt.hash(touristPassword, 12);

    const existingTourist = await db.select().from(tourists).where(eq(tourists.email, touristEmail)).limit(1);

    if (existingTourist.length > 0) {
      await db.update(tourists)
        .set({
          passwordHash: touristHash,
          currentLat: 31.3260,
          currentLng: 75.5762,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(tourists.email, touristEmail));
      console.log("Updated existing test tourist!");
    } else {
      await db.insert(tourists).values({
        name: "Test Tourist",
        email: touristEmail,
        phone: "+919876543210",
        passportNumber: "Z1234567",
        passwordHash: touristHash,
        dateOfBirth: "1995-01-01",
        address: "Hotel Taj Palace, New Delhi",
        gender: "Male",
        nationality: "US",
        bloodType: "O+",
        allergies: ["peanuts"],
        medicalConditions: ["asthma"],
        emergencyContact: { name: "Jane Doe", phone: "+15550199", relationship: "Spouse" },
        currentLat: 31.3260,
        currentLng: 75.5762,
        safetyScore: 100,
        isActive: true,
      });
      console.log("Created new test tourist!");
    }

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();
