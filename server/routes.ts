import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertUserSchema, insertBusSchema, insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./auth";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "routesync-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordValid = await verifyPassword(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { password: _pw, ...safeUser } = user;
      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const data = api.auth.register.input.parse(req.body);

      const registrationData = {
        ...data,
        role: "parent" as const,
        password: await hashPassword(data.password),
      };

      const existing = await storage.getUserByUsername(registrationData.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });

      const user = await storage.createUser(registrationData);
      const { password: _pw, ...safeUser } = user;
      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).send();
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(401).send();
      const { password: _pw, ...safeUser } = user;
      res.json(safeUser);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  function requireAdmin(req: any, res: any, next: any) {
    if (!req.session.userId || req.session.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }

  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.buses.list.path, requireAuth, async (req, res) => {
    try {
      const allBuses = await storage.getBuses();
      res.json(allBuses);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  app.patch(api.buses.updateLocation.path, requireAuth, async (req, res) => {
    try {
      const busId = Number(req.params.id);
      const { lat, lng } = api.buses.updateLocation.input.parse(req.body);

      const updatedBus = await storage.updateBusLocation(busId, lat, lng);

      if (!updatedBus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.json(updatedBus);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.students.list.path, requireAuth, async (req, res) => {
    try {
      const allStudents = await storage.getStudents();
      res.json(allStudents);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post(api.students.create.path, requireAdmin, async (req, res) => {
    try {
      const schoolsList = await storage.getSchools();
      const defaultSchoolId = schoolsList.length > 0 ? schoolsList[0].id : 1;

      const data = insertStudentSchema.parse({
        ...req.body,
        schoolId: req.body.schoolId || defaultSchoolId,
        homeLat: req.body.homeLat || 31.95,
        homeLng: req.body.homeLng || 35.91,
      });
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (e) {
      console.error("Error creating student:", e);
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  app.patch("/api/students/:id/location", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { homeLat, homeLng } = z
        .object({ homeLat: z.number(), homeLng: z.number() })
        .parse(req.body);
      const student = await storage.updateStudentLocation(id, homeLat, homeLng);
      res.json(student);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.patch("/api/students/:id/bus", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { busId } = z.object({ busId: z.number() }).parse(req.body);
      const student = await storage.linkStudentToBus(id, busId);
      res.json(student);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.delete("/api/buses/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteBus(id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete bus" });
    }
  });

  app.patch("/api/buses/:id/driver", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { driverId } = z.object({ driverId: z.number() }).parse(req.body);
      const bus = await storage.assignBusDriver(id, driverId);
      res.json(bus);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const safeUsers = allUsers.map(({ password: _pw, ...u }) => u);
      res.json(safeUsers);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });
      const hashedData = { ...data, password: await hashPassword(data.password) };
      const user = await storage.createUser(hashedData);
      const { password: _pw, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (e) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/students/link", requireAuth, async (req, res) => {
    try {
      const { studentNumber, parentId } = z
        .object({
          studentNumber: z.string(),
          parentId: z.number(),
        })
        .parse(req.body);

      const student = await storage.getStudentByNumber(studentNumber);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const updated = await storage.linkStudentToParent(student.id, parentId);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.parent.student.path, requireAuth, async (req, res) => {
    try {
      const parentId = req.session.userId!;
      const allStudents = await storage.getStudents();
      const student = allStudents.find((s) => s.parentId === parentId) || null;

      if (!student) {
        return res.status(404).json({ message: "No linked student found" });
      }

      const bus = student.busId
        ? (await storage.getBuses()).find((b) => b.id === student.busId) || null
        : null;
      const schoolsList = await storage.getSchools();
      const school = student.schoolId
        ? schoolsList.find((s) => s.id === student.schoolId) || null
        : null;
      const allUsers = await storage.getUsers();
      const driver = bus?.driverId
        ? allUsers.find((u) => u.id === bus.driverId) || null
        : null;
      const safeDriver = driver ? (({ password: _pw, ...d }) => d)(driver) : null;

      res.json({ student, bus, driver: safeDriver, school });
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch student data" });
    }
  });

  app.post("/api/buses", requireAdmin, async (req, res) => {
    try {
      const schoolsList = await storage.getSchools();
      const defaultSchoolId = schoolsList.length > 0 ? schoolsList[0].id : 1;

      const data = insertBusSchema.parse({
        ...req.body,
        schoolId: req.body.schoolId || defaultSchoolId,
        status: req.body.status || "inactive",
        currentLat: req.body.currentLat || 31.95,
        currentLng: req.body.currentLng || 35.91,
      });
      const bus = await storage.createBus(data);
      res.status(201).json(bus);
    } catch (e) {
      console.error("Error creating bus:", e);
      res.status(400).json({ message: "Invalid bus data" });
    }
  });

  return httpServer;
}
