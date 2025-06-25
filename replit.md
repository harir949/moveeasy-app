# MoveEasy - Moving Services Booking Platform

## Overview

MoveEasy is a full-stack web application for booking moving services. It provides a customer-facing booking form where users can submit their moving requirements, upload photos, and schedule their move, along with an admin interface for managing bookings.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Hook Form for form state, TanStack Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **File Uploads**: Multer for handling image uploads
- **Storage**: Currently using in-memory storage (MemStorage) with interface for future database integration
- **Database Ready**: Drizzle ORM configured for PostgreSQL migration

### Data Storage Solutions
- **Current**: In-memory storage for development
- **Planned**: PostgreSQL with Drizzle ORM (configuration ready)
- **File Storage**: Local filesystem for uploaded images
- **Schema**: Defined in shared/schema.ts with Zod validation

## Key Components

### Customer Booking Flow
1. **Multi-step Form**: Contact info → Move details → Photo uploads → Scheduling
2. **Form Validation**: Zod schemas for type-safe validation
3. **File Upload**: Image upload for house and items photos
4. **Calendar Selection**: Custom calendar component for date selection
5. **Confirmation**: Success dialog with booking details

### Admin Dashboard
- **Bookings Overview**: View all customer bookings
- **Status Management**: Update booking status (pending, confirmed, completed, cancelled)
- **Photo Gallery**: View uploaded customer photos
- **Contact Information**: Access customer details and requirements

### API Endpoints
- `POST /api/bookings` - Create new booking with file uploads
- `GET /api/bookings` - Retrieve all bookings (admin)
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /uploads/*` - Serve uploaded files

## Data Flow

1. **Customer Journey**:
   - Customer fills multi-step booking form
   - Photos uploaded and stored locally
   - Form data validated with Zod schemas
   - Booking created and stored in memory
   - Confirmation displayed to customer

2. **Admin Workflow**:
   - Admin accesses dashboard to view bookings
   - Can update booking status
   - View customer details and photos
   - Real-time updates via TanStack Query

3. **File Handling**:
   - Images uploaded via multipart form data
   - Stored in uploads/ directory
   - Served statically by Express
   - File paths stored in booking records

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database driver for Neon PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation
- **multer**: File upload handling

### UI Libraries
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation utilities

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Development
- Uses Vite dev server for frontend
- Express server with hot reload
- In-memory storage for rapid development
- File uploads to local uploads/ directory

### Production Build
- Frontend: `vite build` generates static assets
- Backend: `esbuild` bundles server code
- Deployment target: Autoscale on Replit
- Port configuration: Internal 5000, external 80

### Database Migration
- Drizzle migrations configured for PostgreSQL
- Environment variable: `DATABASE_URL` required
- Migration command: `npm run db:push`
- Schema defined in shared/schema.ts

## Recent Changes
- June 25, 2025: Enhanced booking form with Greek location autocomplete, floor/parking/elevator details, room-based item selection, and enhanced phone number validation
- June 25, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.