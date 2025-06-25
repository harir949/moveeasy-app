import { users, bookings, type User, type InsertUser, type Booking, type InsertBooking } from "@shared/schema";
import { FirebaseStorage } from "./firebase-storage";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private currentUserId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking,
      countryCode: insertBooking.countryCode || "+30",
      email: insertBooking.email || null,
      homeSize: insertBooking.homeSize || null,
      specialRequirements: insertBooking.specialRequirements || null,
      additionalNotes: insertBooking.additionalNotes || null,
      customMoveType: insertBooking.customMoveType || null,
      itemsDescription: insertBooking.itemsDescription || null,
      pickupFloor: insertBooking.pickupFloor || null,
      dropoffFloor: insertBooking.dropoffFloor || null,
      pickupParking: insertBooking.pickupParking || false,
      dropoffParking: insertBooking.dropoffParking || false,
      pickupElevator: insertBooking.pickupElevator || false,
      dropoffElevator: insertBooking.dropoffElevator || false,
      startLocationCoords: insertBooking.startLocationCoords || null,
      endLocationCoords: insertBooking.endLocationCoords || null,
      selectedRooms: insertBooking.selectedRooms || {},
      id,
      status: "pending",
      createdAt: new Date(),
      housePhotos: (insertBooking.housePhotos as string[]) || [],
      itemsPhotos: (insertBooking.itemsPhotos as string[]) || []
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }
}

// Choose storage implementation based on environment
export const storage = process.env.USE_FIREBASE === 'true' 
  ? new FirebaseStorage() 
  : new MemStorage();
