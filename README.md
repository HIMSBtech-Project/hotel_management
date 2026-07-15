# HotelReserve - Online Booking Management System

HotelReserve is a MERN foundation for a hotel reservation application. It uses a React frontend with React Router, an Express backend, JWT authentication, and a local MongoDB database through Mongoose.

## Actors

- **Guest:** Browse starter room listings and search availability.
- **Customer:** Register, login, book rooms, and view booking history.
- **Admin:** Manage room inventory and update booking statuses.

## Technology Stack

- **Frontend:** HTML, CSS, React, React Router, Axios, Vite.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB running locally with Mongoose.
- **Security:** JWT authorization and bcrypt password hashing.

## Project Structure

```text
hotelreserve/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Shared UI components
│   │   └── pages/          # Route pages
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Database connection
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth guards
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── .env
│   ├── index.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v18 or newer
- MongoDB Community Server installed and running locally

### Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend reads `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hotelreserve
JWT_SECRET=hotel_secret_2024
```

The API runs at `http://localhost:5000`.

Seed starter Cameroon rooms:

```bash
cd server
npm run seed
```

### Frontend Setup

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## API Routes

- `GET /` - API status text.
- `GET /api/health` - JSON health check.
- `POST /api/auth/register` - Create a customer or admin account.
- `POST /api/auth/login` - Login and receive a JWT.
- `GET /api/auth/me` - Return the current authenticated user.
- `GET /api/rooms` - List rooms with optional filters.
- `GET /api/rooms/:id` - Get one room.
- `POST /api/rooms` - Admin creates a room.
- `PUT /api/rooms/:id` - Admin updates a room.
- `DELETE /api/rooms/:id` - Admin deletes a room.
- `POST /api/bookings` - Customer creates a booking.
- `GET /api/bookings/my` - Customer booking history.
- `GET /api/bookings` - Admin views all bookings.
- `PATCH /api/bookings/:id/status` - Admin updates booking status.

## Running MongoDB Locally

1. Start MongoDB Community Server.
2. Keep `MONGO_URI=mongodb://127.0.0.1:27017/hotelreserve`.
3. MongoDB creates the `hotelreserve` database when the first user or seeded room is created.

## Suggested Next Features

- Payment processing.
- Customer booking cancellation.
- Room image uploads instead of image URLs.
- Stronger production security settings for JWT secrets and CORS.
