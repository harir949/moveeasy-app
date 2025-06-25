import { db, FieldValue } from './firebase';
import { IStorage } from './storage';
import type { User, InsertUser, Booking, InsertBooking } from '@shared/schema';

export class FirebaseStorage implements IStorage {
  private usersCollection = 'users';
  private bookingsCollection = 'bookings';

  async getUser(id: number): Promise<User | undefined> {
    try {
      const doc = await db.collection(this.usersCollection).doc(id.toString()).get();
      if (!doc.exists) {
        return undefined;
      }
      return { id, ...doc.data() } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const snapshot = await db.collection(this.usersCollection)
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const doc = snapshot.docs[0];
      return { id: parseInt(doc.id), ...doc.data() } as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Generate a new document reference to get an ID
      const docRef = db.collection(this.usersCollection).doc();
      const id = parseInt(docRef.id.slice(-10), 36); // Convert to number
      
      const userData = {
        ...insertUser,
        createdAt: FieldValue.serverTimestamp(),
      };
      
      await docRef.set(userData);
      
      return { id, ...insertUser };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    try {
      // Generate a new document reference
      const docRef = db.collection(this.bookingsCollection).doc();
      const id = parseInt(docRef.id.slice(-10), 36); // Convert to number
      
      const bookingData = {
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
        housePhotos: insertBooking.housePhotos || [],
        itemsPhotos: insertBooking.itemsPhotos || [],
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      };
      
      await docRef.set(bookingData);
      
      // Return the booking with current timestamp
      return {
        id,
        ...bookingData,
        createdAt: new Date(),
      } as Booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    try {
      // Try to find by numeric ID first, then by document ID
      let doc = await db.collection(this.bookingsCollection).doc(id.toString()).get();
      
      if (!doc.exists) {
        // Search by numeric ID in the data
        const snapshot = await db.collection(this.bookingsCollection)
          .where('id', '==', id)
          .limit(1)
          .get();
        
        if (snapshot.empty) {
          return undefined;
        }
        doc = snapshot.docs[0];
      }
      
      const data = doc.data();
      return {
        id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
      } as Booking;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      const snapshot = await db.collection(this.bookingsCollection)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || parseInt(doc.id.slice(-10), 36),
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Booking;
      });
    } catch (error) {
      console.error('Error getting all bookings:', error);
      throw error;
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    try {
      // Find the document by ID
      const snapshot = await db.collection(this.bookingsCollection)
        .where('id', '==', id)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const doc = snapshot.docs[0];
      await doc.ref.update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      // Get updated document
      const updatedDoc = await doc.ref.get();
      const data = updatedDoc.data();
      
      return {
        id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
      } as Booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
}