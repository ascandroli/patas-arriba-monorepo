# Product Requirements Document — Patas Arriba

## Overview

Patas Arriba is a volunteer coordination platform for **Fundacion Patas Arriba**, an animal welfare foundation in Spain. The platform enables volunteers to discover events, sign up to participate, and coordinate transportation through car groups.

The app is a mobile-first Progressive Web App (PWA) with push notification support, built in Spanish.

## User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Pending** | Newly registered user awaiting approval | Can only see the registration confirmation. Cannot log in. |
| **User** | Approved volunteer | View events, join/leave events, create/join car groups, view own profile, send messages |
| **Organizer** | Event coordinator | Everything a User can do + create events, edit events, manage attendees (tasks, attendance), view all users, approve pending users |
| **Admin** | Full platform access | Everything an Organizer can do + view all event details without joining, manage user roles |

New users register with role `pending` and must be activated by an organizer or admin before they can log in.

## Core Features

### 1. Authentication

- **Signup**: Email, username, full name, phone (with country code), password with confirmation
- **Login**: Via email or username + password
- **Password recovery**: Email-based reset link (15-minute expiry via Brevo)
- **Session**: JWT stored in localStorage, 90-day expiry
- **Route protection**: Private routes redirect to `/login`; anon-only routes redirect to `/` if logged in

### 2. Events

- **Create** (organizer/admin): Title, category (protectora/recogida/mercadillo/otro), location, date, time, car organization toggle, task assignment toggle
- **List**: Upcoming and past events with attendee counts
- **Details**: Full event info, attendee list, car groups, message board
- **Join/Leave**: Users join open events; leaving also removes from associated car groups
- **Edit** (organizer/admin): Basic info, description, status (open/closed/cancelled), delete
- **Status flow**: open → closed → (cancelled at any point)
- **Push notifications**: Sent to all users when a new event is created

### 3. Car Groups

- **Create**: Available seats, car brand/model, color, pickup location, pickup time
- **Search & Join**: Browse available car groups for an event, select one, join
- **Details**: Pickup info, car info, driver and passenger list with phone numbers, message board
- **Edit/Delete** (owner only): Update car group info or delete it
- **Leave** (passenger): Leave a car group
- **Constraints**: One car group per user per event (as owner or passenger); must be an event attendee

### 4. User Management

- **Own profile**: View and edit username, full name, avatar icon/color; view email and phone (read-only, contact admin to change)
- **User list** (organizer/admin): View all users, search by name/username, see pending users at top
- **User details** (organizer/admin): View user info, approve pending users
- **Notification settings**: Enable/disable push notifications

### 5. Messaging

- **Event message board**: Visible to attendees and admins
- **Car group message board**: Visible to car group members (owner + passengers) and organizer/admin
- **Real-time**: Socket.io for live message updates

## Navigation

### Navbar (hamburger drawer)

**Anonymous users see:**
- Inicio (Home)
- Registro (Signup)
- Acceso (Login)

**Logged-in users see:**
- Inicio (Home)
- Tu Perfil (Own Profile)
- Eventos (Event List)
- Glosario (Glossary)
- Cerrar Sesion (Logout)

**Organizer/Admin additionally see:**
- Crear Evento (Create Event)
- Ver Usuarios (User List)

**Top bar (logged in):** Username, role badge, profile icon link

## Technical Constraints

- Mobile-first responsive design (Material-UI, max-width `sm` container)
- Spanish language throughout (all UI text, error messages, validations)
- PWA with service worker for push notifications
- JWT auth with 90-day expiry
- MongoDB for persistence
- Categories: `protectora`, `recogida`, `mercadillo`, `otro`
- Event statuses: `open`, `closed`, `cancelled`
- Attendee attendance: `pending`, `show`, `no-show`, `excused`