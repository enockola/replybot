# ReplyBot – Canned Response & Support Workflow System

## 1. Project Description

ReplyBot is a server-side rendered web application designed for support agents and customer service teams. The system allows users to access categorized canned response templates (e.g., intro, sympathy, survey, outro) during phone calls, chats, or emails.

Users can also submit support tickets or canned response suggestions. Tickets move through multiple workflow stages and track status history. Administrators and vendors can manage content and respond to user submissions.

This project demonstrates database relationships, authentication/authorization, MVC architecture, workflow systems, and secure server-side development using Node.js, Express, PostgreSQL, and EJS.

---

## 2. Database Schema

Below is the Entity Relationship Diagram (ERD) exported from pgAdmin:

![ERD](./documentation/erd.png)

The database includes:
- Users
- Roles
- Categories
- Canned Responses
- Tickets
- Ticket Messages
- Ticket Status History

Foreign keys enforce relationships and cascading behavior is applied where appropriate.

---

## 3. User Roles

### Admin / Owner
- Full access to all routes
- Manage users and roles
- Add/edit/delete response categories
- Add/edit/delete responses
- Assign tickets
- Update ticket status
- Moderate user content

### Vendor
- View assigned tickets
- Respond to tickets
- Update ticket status
- View response library

### Standard User
- Register and login
- View response library
- Submit response suggestions
- Create support tickets
- View ticket history and status
- Edit/delete their own submissions

---

## 4. Test Account Credentials

All accounts use the password:

P@$$w0rd!

### Admin
Email: admin@example.com

### Vendor
Email: vendor@example.com

### Standard User
Email: user@example.com

---

## 5. Known Limitations

- Pagination is not implemented for large datasets.
- Response version history is simplified.
- Vendor assignment is manual (no auto-assignment logic).
- UI styling is minimal and focuses on functionality.

## Project Plan / Roadmap

I will implement the project in ordered sprints. The high level sprints are:

- **Sprint 0 — Project setup & skeleton**: repo, express server, EJS, basic structure.
- **Sprint 1 — Database schema & ERD**: migrations, seeds, ERD export.
- **Sprint 2 — Authentication**: session-based auth with bcrypt and protected routes.
- **Sprint 3 — Snippet library**: CRUD for snippets with admin approval.
- **Sprint 4 — Ticket workflow**: multi-stage tickets, message threads, status history.
- **Sprint 5 — Admin dashboard**: user & content management, ticket assignment.
- **Sprint 6 — Security & validation**: sanitization, session hardening, global error handler.
- **Sprint 7 — Tests & deployment prep**: basic tests, finalize README, Render configuration.
- **Sprint 8 — Final polish & submission**: cleanup, ensure required commits, demo.

See `PROJECT_PLAN.md` for the full task list, acceptance criteria, and commit guidance.