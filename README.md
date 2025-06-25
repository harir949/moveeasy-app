# MoveEasy - Moving Services Booking Platform

A comprehensive booking application for moving services with address autocomplete, interactive maps, and admin dashboard.

## Features

- **Customer Booking Form**: Multi-step form with contact details, move requirements, and photo uploads
- **Address Autocomplete**: Street-level search using OpenStreetMap and Nominatim API
- **Interactive Maps**: Route visualization with distance and duration estimates
- **Admin Dashboard**: Booking management with status updates and photo gallery
- **Room-Based Item Selection**: Detailed inventory management by room
- **Photo Upload**: Support for house and item photos
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js + Express, TypeScript
- **Database**: In-memory storage (with Firebase Firestore integration ready)
- **Maps**: OpenStreetMap + Leaflet (free alternative to Google Maps)
- **File Upload**: Multer for image handling

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Extract the project files**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables (Optional)**
   Create a `.env` file in the root directory:
   ```
   # Database (optional - defaults to in-memory storage)
   USE_FIREBASE=false
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components
│   │   ├── lib/         # Utilities and queries
│   │   └── hooks/       # Custom React hooks
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data storage interface
├── shared/              # Shared types and schemas
└── uploads/             # File upload directory
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Key Features Implemented

### Booking Flow
1. Contact information with enhanced phone validation
2. Pickup/delivery locations with Greek address support
3. Move details (floors, parking, elevator access)
4. Room-based item selection
5. Photo uploads for house and items
6. Calendar date selection
7. Booking confirmation

### Admin Features
- View all bookings
- Update booking status
- View customer photos
- Export booking details

### Technical Highlights
- Free OpenStreetMap integration (no API costs)
- Robust error handling for network requests
- Responsive design with mobile support
- Type-safe development with TypeScript
- Modern React patterns with hooks and context

## Database Options

The application supports two storage modes:

1. **In-Memory Storage** (default): Perfect for development and testing
2. **Firebase Firestore**: Production-ready cloud database

Switch between modes using the `USE_FIREBASE` environment variable.

## Contributing

The codebase follows modern React/TypeScript best practices:
- Component composition with shadcn/ui
- Form validation with Zod schemas
- Server state management with TanStack Query
- Clean separation between frontend and backend

## License

This project is for demonstration purposes.