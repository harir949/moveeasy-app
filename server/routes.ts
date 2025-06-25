import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Create a new booking
  app.post('/api/bookings', upload.fields([
    { name: 'housePhotos', maxCount: 10 },
    { name: 'itemsPhotos', maxCount: 10 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Parse the booking data
      const bookingData = {
        ...req.body,
        housePhotos: files?.housePhotos?.map(file => `/uploads/${file.filename}`) || [],
        itemsPhotos: files?.itemsPhotos?.map(file => `/uploads/${file.filename}`) || []
      };

      // Validate the booking data
      const validatedData = insertBookingSchema.parse(bookingData);
      
      // Create the booking
      const booking = await storage.createBooking(validatedData);
      
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: error instanceof Error ? error.message : "Failed to create booking" 
        });
      }
    }
  });

  // Get all bookings (admin)
  app.get('/api/bookings', async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch bookings" 
      });
    }
  });

  // Get a specific booking
  app.get('/api/bookings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch booking" 
      });
    }
  });

  // Update booking status
  app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update booking status" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
