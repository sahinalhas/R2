# Rehber2 - Rehberlik ve Psikolojik Danışmanlık Yönetim Sistemi

## Overview

Rehber2 is a comprehensive guidance and counseling management system designed for educational institutions. The application helps counselors manage students, appointments, sessions, reports, and surveys. It features a modern React frontend with a Node.js/Express backend, using SQLite for data persistence.

**Core Purpose:** Streamline administrative tasks for school counselors, including student tracking, appointment scheduling, session documentation, report generation, and survey management.

**Tech Stack:**
- **Frontend:** React with TypeScript, Vite, TailwindCSS, Radix UI components
- **Backend:** Node.js with Express, TypeScript
- **Database:** SQLite with Drizzle ORM
- **Real-time:** WebSocket for notifications
- **State Management:** TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Modern React application using functional components and hooks
- UI built with Radix UI primitives and custom shadcn/ui components
- TailwindCSS for styling with a customizable theme system (theme.json)
- Client-side routing with Wouter
- Form handling with React Hook Form and Zod validation

**State Management:**
- TanStack Query for server state management and caching
- Context API for theme management (ThemeContext)
- Custom NotificationContext for real-time notifications
- WebSocket integration for live updates

**Key Features:**
- Responsive mobile-first design with dedicated mobile navigation
- Real-time notification system with toast notifications
- Multi-page application with dedicated views for students, appointments, sessions, reports, surveys, and statistics
- Student detail pages with tabbed interfaces
- Survey creation with Excel import/export capabilities

### Backend Architecture

**Layered Architecture:**
1. **Routes Layer** (`server/routes/`): Modular route definitions for each domain (students, appointments, sessions, reports, surveys, etc.)
2. **Services Layer** (`server/services/`): Business logic and data validation
   - BaseService provides common functionality (caching, error handling, performance monitoring)
   - Specialized services for each domain (StudentService, AppointmentService, etc.)
3. **Storage Layer** (`server/storage/`): Database operations abstracted through storage classes
   - BaseStorage provides common database utilities
   - Specialized storage classes for each entity
4. **Middleware Layer** (`server/middlewares/`): Request processing, logging, error handling

**Design Patterns:**
- **Repository Pattern:** Storage layer abstracts database operations
- **Service Pattern:** Business logic separated from route handlers
- **Factory Pattern:** Centralized service initialization
- **Singleton Pattern:** Shared database connection and WebSocket server

**Error Handling:**
- Custom ApiError hierarchy with specific error types (ValidationError, NotFoundError, BusinessError, DatabaseError)
- Centralized error handling middleware
- Structured error responses with categories and HTTP status codes
- Comprehensive logging with different log levels and sources

**Caching Strategy:**
- In-memory caching in BaseService with configurable TTL
- Cache invalidation on data updates
- Domain-specific cache keys (e.g., `students:all`, `appointments:student:123`)

**Performance Monitoring:**
- Built-in performance measurement in BaseService
- Request/response logging with duration tracking
- Unique request IDs for tracing

### Data Schema

**Core Entities:**
- **Students:** Student profiles with personal information, class, parent contacts
- **Appointments:** Scheduled appointments with type, date, time, duration, status
- **Sessions:** Counseling session records with summaries and outcomes
- **Reports:** Various report types (behavioral, academic, career) with templates support
- **Report Templates:** Reusable templates for generating standardized reports
- **Surveys:** Custom surveys with questions and response tracking
- **Survey Assignments:** Student-to-survey assignments with completion tracking
- **Survey Responses:** Individual student responses to surveys
- **Survey Imports:** Excel-based bulk survey data imports
- **Activities:** System activity log for audit trail
- **Reminders:** Scheduled reminders for appointments

**Database:**
- SQLite database with Drizzle ORM
- Schema-first approach with TypeScript types generated from Drizzle schema
- Migration support through Drizzle Kit
- Auto-migration on server startup to ensure schema compatibility

**Data Validation:**
- Zod schemas for runtime validation
- Shared validation schemas between frontend and backend (`@shared/schema`)
- Type-safe database queries with Drizzle

### External Dependencies

**Frontend Libraries:**
- **@tanstack/react-query:** Server state management and caching
- **@radix-ui/*:** Headless UI primitives for accessible components
- **wouter:** Lightweight client-side routing
- **react-hook-form + @hookform/resolvers:** Form handling with Zod integration
- **cmdk:** Command palette component
- **date-fns:** Date manipulation utilities
- **class-variance-authority + clsx:** Dynamic className handling

**Backend Libraries:**
- **drizzle-orm + better-sqlite3:** Database ORM and SQLite driver
- **express:** Web framework
- **express-fileupload:** File upload handling for Excel imports
- **ws:** WebSocket implementation for real-time notifications
- **zod:** Runtime type validation
- **nanoid:** Unique ID generation

**Development Tools:**
- **Vite:** Build tool and dev server with HMR
- **TypeScript:** Type safety across the stack
- **TailwindCSS:** Utility-first CSS framework
- **esbuild:** Server-side bundling for production

**Third-party Integrations:**
- **Replit Platform:** Development environment integration with cartographer plugin
- **WebSocket Server:** Real-time notification delivery to connected clients

**File Storage:**
- Temporary file storage in `/tmp/` directory for Excel uploads
- SQLite database stored in `./data/database.sqlite`
- Persistent data directory created automatically on startup

**API Design:**
- RESTful API endpoints with consistent response formats
- Standardized success/error responses via utility functions
- Query parameter support for filtering (e.g., by studentId, date, type)
- File upload endpoints for survey imports