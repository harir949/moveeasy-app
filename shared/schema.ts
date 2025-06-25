import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  moveType: text("move_type").notNull(),
  itemsDescription: text("items_description").notNull(),
  homeSize: text("home_size"),
  specialRequirements: text("special_requirements"),
  selectedDate: text("selected_date").notNull(),
  timePreference: text("time_preference").notNull(),
  additionalNotes: text("additional_notes"),
  housePhotos: json("house_photos").$type<string[]>().default([]),
  itemsPhotos: json("items_photos").$type<string[]>().default([]),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
}).extend({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  startLocation: z.string().min(1, "Pick-up location is required"),
  endLocation: z.string().min(1, "Drop-off location is required"),
  moveType: z.string().min(1, "Move type is required"),
  itemsDescription: z.string().min(1, "Items description is required"),
  selectedDate: z.string().min(1, "Move date is required"),
  timePreference: z.string().min(1, "Time preference is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
