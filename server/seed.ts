import { storage } from "./storage";
import { log } from "./index";
import { hashPassword } from "./auth";

export async function seed() {
  try {
    const schoolsList = await storage.getSchools();
    if (schoolsList.length === 0) {
      await storage.createSchool({
        name: "Default School",
        address: "123 Education St",
        lat: 31.95,
        lng: 35.91,
      });
      log("Default school created successfully", "seed");
    }

    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      const hashedPassword = await hashPassword("admin123");
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        name: "System Administrator",
        email: "admin@routesync.com",
        schoolId: null,
      });
      log("Admin user created successfully", "seed");
    } else {
      log("Admin user already exists", "seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
