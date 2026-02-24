# ReplyBot Project – Sprint Plan

This sprint plan outlines the phased development strategy for the ReplyBot application.  
The goal is to build the project incrementally while ensuring all rubric requirements are satisfied.

---

# Project Overview

ReplyBot is a server-side rendered web application that provides:

- A categorized snippet (canned response) library
- A multi-stage ticket workflow system
- Role-based access control (Admin, Vendor, Standard User)
- An admin management dashboard

The project demonstrates:
- Relational database design
- Session-based authentication
- Authorization
- MVC architecture
- Dynamic content management
- Multi-stage workflow system
- Secure development practices
- Production deployment

---

# Sprint 1 – Foundation & Infrastructure

**Goal:** Establish clean architecture and rendering.

## Tasks
- [ ] Initialize Express project (ESM syntax)
- [ ] Configure PostgreSQL connection
- [ ] Set up EJS with layouts and partials
- [ ] Create project folder structure:
  - controllers/
  - models/
  - routes/
  - middleware/
  - views/
  - config/
- [ ] Implement global error handler
- [ ] Create basic layout template
- [ ] Create placeholder pages:
  - Home
  - Login
  - Register
  - Snippets
  - Tickets
  - Admin Dashboard
- [ ] Verify server runs without errors

**Deliverable:** Functional Express app with rendering and DB connection.

---

# Sprint 2 – Authentication & Authorization

**Goal:** Secure user system with roles.

## Database
- [ ] Create roles table
- [ ] Create users table with foreign key to roles
- [ ] Seed roles (Admin, Vendor, Standard User)

## Implementation
- [ ] Implement bcrypt password hashing
- [ ] Configure express-session
- [ ] Create login form
- [ ] Create registration form
- [ ] Implement requireAuth middleware
- [ ] Implement requireRole middleware
- [ ] Protect admin-only routes
- [ ] Protect vendor-specific routes
- [ ] Secure session configuration:
  - httpOnly
  - sameSite
  - secure (production only)

**Deliverable:** Users can register/login, roles properly restrict access.

---

# Sprint 3 – Snippet Library System

**Goal:** Fully functional categorized snippet management.

## Database
- [ ] Create categories table
- [ ] Create snippets table
  - category_id (FK)
  - created_by (FK)
  - approved flag
- [ ] Add appropriate ON DELETE behavior

## Features
- [ ] Admin can:
  - Add category
  - Edit category
  - Delete category
  - Add snippet
  - Edit snippet
  - Delete snippet
- [ ] Users can:
  - View snippet library
  - Filter by category (query parameters)
- [ ] Standard users can submit snippet suggestions
- [ ] Users can edit/delete their own submissions

**Deliverable:** Dynamic snippet system tied to database.

---

# Sprint 4 – Ticket Workflow System (Multi-Stage)

**Goal:** Implement multi-stage status tracking.

## Database
- [ ] Create tickets table
  - status field
  - user_id (FK)
  - assigned_vendor_id (FK, nullable)
- [ ] Create ticket_messages table
- [ ] Create ticket_status_history table

## Status Flow Example
- received
- assigned
- in_progress
- resolved
- closed

## Features
- [ ] User can:
  - Create ticket
  - View ticket
  - View status history
- [ ] Vendor/Admin can:
  - Respond to ticket
  - Change ticket status
- [ ] All status changes logged in history table

**Deliverable:** Complete multi-stage workflow with history tracking.

---

# Sprint 5 – Admin Dashboard

**Goal:** Provide full management interface.

## Admin Capabilities
- [ ] View all users
- [ ] Change user roles
- [ ] Delete users (with appropriate FK handling)
- [ ] View all tickets
- [ ] Assign tickets to vendors
- [ ] Moderate snippets
- [ ] Delete inappropriate user submissions

## Optional Enhancements
- [ ] Dashboard summary statistics
  - Total tickets
  - Open tickets
  - Total snippets

**Deliverable:** Fully functional admin management system.

---

# Sprint 6 – Security & Validation

**Goal:** Harden application security.

## Tasks
- [ ] Parameterized queries everywhere
- [ ] Server-side validation for all forms
- [ ] Prevent empty submissions
- [ ] Input sanitization
- [ ] Proper error messages (no stack traces in production)
- [ ] Test role-based route protection
- [ ] Test session expiration behavior

**Deliverable:** Secure and validated application.

---

# Sprint 7 – Deployment & Documentation

**Goal:** Production-ready deployment and complete documentation.

## Deployment
- [ ] Deploy to Render
- [ ] Configure production PostgreSQL
- [ ] Set environment variables
- [ ] Ensure .env not committed
- [ ] Confirm no development-only code in production

## Documentation
- [ ] Export ERD from pgAdmin
- [ ] Add ERD image to /documentation
- [ ] Complete README:
  - Project description
  - Database schema
  - User roles explanation
  - Test account credentials
  - Known limitations
- [ ] Verify minimum 15 substantial commits

**Deliverable:** Fully deployed and documented application.

---

# Development Order Summary

Build in this order:

Foundation → Authentication → Snippets → Tickets → Admin → Security → Deployment

Do not skip ahead.

---

# Definition of Done

The project is complete when:

- All rubric core concepts are demonstrated
- Multi-stage workflow is functioning with status history
- Roles properly restrict access
- Admin dashboard manages users and content
- Application is deployed on Render
- ERD is included in README
- At least 15 meaningful commits exist
- No major security issues remain