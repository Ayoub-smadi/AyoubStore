import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertUserSchema, insertBusSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Mock login for demonstration
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      // In a real app, verify password hash
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Setting a simple cookie/session for mock auth
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const data = api.auth.register.input.parse(req.body);
      
      // Force role to 'parent' for public registration
      const registrationData = {
        ...data,
        role: 'parent' as const
      };

      const existing = await storage.getUserByUsername(registrationData.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });
      
      const user = await storage.createUser(registrationData);
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.json({ message: "Logged out" });
  });

  app.get(api.auth.me.path, async (req, res) => {
    // Mock session - for demo just return null or first user
    res.status(401).send();
  });

  app.get(api.stats.get.path, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.buses.list.path, async (req, res) => {
    try {
      const allBuses = await storage.getBuses();
      res.json(allBuses);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  app.patch(api.buses.updateLocation.path, async (req, res) => {
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

  app.get(api.students.list.path, async (req, res) => {
    try {
      const allStudents = await storage.getStudents();
      res.json(allStudents);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.patch("/api/students/:id/location", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { homeLat, homeLng } = z.object({ homeLat: z.number(), homeLng: z.number() }).parse(req.body);
      const student = await (storage as any).updateStudentLocation(id, homeLat, homeLng);
      res.json(student);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.patch("/api/students/:id/bus", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { busId } = z.object({ busId: z.number() }).parse(req.body);
      const student = await (storage as any).linkStudentToBus(id, busId);
      res.json(student);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.delete("/api/buses/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await (storage as any).deleteBus(id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete bus" });
    }
  });

  app.patch("/api/buses/:id/driver", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { driverId } = z.object({ driverId: z.number() }).parse(req.body);
      const bus = await (storage as any).assignBusDriver(id, driverId);
      res.json(bus);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await (storage as any).getUsers();
      res.json(allUsers);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });
      const user = await storage.createUser(data);
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/students/link", async (req, res) => {
    try {
      const { studentNumber, parentId } = z.object({ 
        studentNumber: z.string(), 
        parentId: z.number() 
      }).parse(req.body);

      const student = await (storage as any).getStudentByNumber(studentNumber);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const updated = await (storage as any).linkStudentToParent(student.id, parentId);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.parent.student.path, async (req, res) => {
    try {
      // In a real app, get parentId from session. For demo, we'll assume it's passed or use a default.
      // Since this is mock auth, let's look for any student linked to a parent.
      const allStudents = await storage.getStudents();
      const student = allStudents.find(s => s.parentId !== null);
      
      if (!student) {
        return res.status(404).json({ message: "No linked student found" });
      }

      const bus = student.busId ? (await storage.getBuses()).find(b => b.id === student.busId) || null : null;
      const school = student.schoolId ? (await (storage as any).getSchools?.() || []).find((s: any) => s.id === student.schoolId) || null : null;
      const driver = bus?.driverId ? (await (storage as any).getUsers?.() || []).find((u: any) => u.id === bus.driverId) || null : null;

      res.json({ student, bus, driver, school });
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch student data" });
    }
  });

  app.post("/api/buses", async (req, res) => {
    try {
      const schoolsList = await storage.getSchools();
      const defaultSchoolId = schoolsList.length > 0 ? schoolsList[0].id : 1;

      const data = insertBusSchema.parse({
        ...req.body,
        schoolId: req.body.schoolId || defaultSchoolId,
        status: req.body.status || 'inactive',
        currentLat: req.body.currentLat || 31.95,
        currentLng: req.body.currentLng || 35.91
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
