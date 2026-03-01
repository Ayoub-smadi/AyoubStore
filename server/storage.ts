import { type User, type InsertUser, type School, type InsertSchool, type Bus, type InsertBus, type Student, type InsertStudent, type Trip, type InsertTrip, type Attendance, type InsertAttendance, type Notification, type InsertNotification } from "@shared/schema";
import { users, schools, buses, students, trips, attendance, notifications } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  
  // Schools
  getSchools(): Promise<School[]>;
  createSchool(school: InsertSchool): Promise<School>;
  
  // Buses
  getBuses(): Promise<Bus[]>;
  updateBusLocation(id: number, lat: number, lng: number): Promise<Bus | undefined>;
  createBus(bus: InsertBus): Promise<Bus>;
  deleteBus(id: number): Promise<boolean>;
  assignBusDriver(id: number, driverId: number): Promise<Bus | undefined>;
  
  // Students
  getStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentLocation(id: number, lat: number, lng: number): Promise<Student | undefined>;
  linkStudentToBus(id: number, busId: number): Promise<Student | undefined>;
  getStudentByNumber(studentNumber: string): Promise<Student | undefined>;
  linkStudentToParent(studentId: number, parentId: number): Promise<Student | undefined>;
  
  // Stats
  getStats(): Promise<{
    totalStudents: number;
    totalParents: number;
    totalDrivers: number;
    totalBuses: number;
    activeTrips: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (user?.username === 'admin') {
      throw new Error("Cannot delete system administrator");
    }
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getSchools(): Promise<School[]> {
    return await db.select().from(schools);
  }

  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const [school] = await db.insert(schools).values(insertSchool).returning();
    return school;
  }

  async getBuses(): Promise<Bus[]> {
    return await db.select().from(buses);
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const [bus] = await db.insert(buses).values(insertBus).returning();
    return bus;
  }

  async deleteBus(id: number): Promise<boolean> {
    await db.delete(buses).where(eq(buses.id, id));
    return true;
  }

  async assignBusDriver(id: number, driverId: number): Promise<Bus | undefined> {
    const [bus] = await db.update(buses)
      .set({ driverId })
      .where(eq(buses.id, id))
      .returning();
    return bus;
  }

  async updateBusLocation(id: number, lat: number, lng: number): Promise<Bus | undefined> {
    const [bus] = await db.update(buses)
      .set({ currentLat: lat, currentLng: lng })
      .where(eq(buses.id, id))
      .returning();
    return bus;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudentLocation(id: number, lat: number, lng: number): Promise<Student | undefined> {
    const [student] = await db.update(students)
      .set({ homeLat: lat, homeLng: lng })
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async linkStudentToBus(id: number, busId: number): Promise<Student | undefined> {
    const [student] = await db.update(students)
      .set({ busId })
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async getStudentByNumber(studentNumber: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentNumber, studentNumber));
    return student;
  }

  async linkStudentToParent(studentId: number, parentId: number): Promise<Student | undefined> {
    const [student] = await db.update(students)
      .set({ parentId })
      .where(eq(students.id, studentId))
      .returning();
    return student;
  }

  async getStats() {
    const allStudents = await db.select().from(students);
    const allUsers = await db.select().from(users);
    const allBuses = await db.select().from(buses);
    const allTrips = await db.select().from(trips);

    const parentsCount = allUsers.filter(u => u.role === 'parent').length;
    const driversCount = allUsers.filter(u => u.role === 'driver').length;
    const activeTripsCount = allTrips.filter(t => t.status === 'active').length;

    return {
      totalStudents: allStudents.length,
      totalParents: parentsCount,
      totalDrivers: driversCount,
      totalBuses: allBuses.length,
      activeTrips: activeTripsCount
    };
  }
}

export const storage = new DatabaseStorage();
