import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
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

  return httpServer;
}
