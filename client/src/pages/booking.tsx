import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookingForm } from "@/components/booking-form";
import { Truck, Phone } from "lucide-react";

export default function Booking() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Truck className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">MoveEasy</h1>
            </div>
            <div className="hidden sm:flex items-center space-x-6">
              <span className="text-sm text-gray-600">Need help?</span>
              <a 
                href="tel:+1234567890" 
                className="text-primary hover:text-blue-700 font-medium flex items-center"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call (123) 456-7890
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingForm />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="text-primary text-xl" />
                <h3 className="text-lg font-bold">MoveEasy</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Professional moving services you can trust. Making your move stress-free and affordable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><Phone className="inline mr-2 h-4 w-4" />(123) 456-7890</div>
                <div>📧 info@moveeasy.com</div>
                <div>📍 123 Main St, City, State</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Residential Moving</li>
                <li>Office Relocation</li>
                <li>Storage Solutions</li>
                <li>Packing Services</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 MoveEasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
