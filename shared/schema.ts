import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // admin, parent, driver
  name: text("name").notNull(),
  email: text("email"),
  schoolId: integer("school_id").references(() => schools.id),
});

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  busNumber: text("bus_number").notNull(),
  driverId: integer("driver_id").references(() => users.id),
  schoolId: integer("school_id").references(() => schools.id),
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  status: text("status").notNull().default('inactive'), // inactive, active
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentNumber: text("student_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  grade: text("grade").notNull(),
  homeLat: doublePrecision("home_lat"),
  homeLng: doublePrecision("home_lng"),
  parentId: integer("parent_id").references(() => users.id),
  schoolId: integer("school_id").references(() => schools.id),
  busId: integer("bus_id").references(() => buses.id),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").references(() => buses.id),
  status: text("status").notNull().default('active'), // active, completed
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id),
  studentId: integer("student_id").references(() => students.id),
  status: text("status").notNull(), // picked_up, dropped_off, absent
  timestamp: timestamp("timestamp").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertBusSchema = createInsertSchema(buses).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, timestamp: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Notification = typeof notifications.$inferSelect;
