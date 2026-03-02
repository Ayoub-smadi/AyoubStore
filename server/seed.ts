import { storage } from "./storage";
import { log } from "./index";

export async function seed() {
  try {
    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      await storage.createUser({
        username: "admin",
        password: "admin123",
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
