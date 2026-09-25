# HotelReserve

HotelReserve is a MERN hotel reservation foundation for Cameroon. It uses React, Express, MongoDB, JWT authentication, and CFA franc (`XAF`) pricing.

## Features

- Browse and search hotel rooms in Buea, Douala, and Yaounde.
- Customer registration, login, booking history, and booking cancellation.
- Server-calculated room totals in XAF.
- Manual MTN Mobile Money and Orange Money payment submission.
- Admin room management, payment verification, and booking oversight.

## Local Setup

Prerequisites: Node.js 18+, MongoDB Community Server running locally.

```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

Set a long `JWT_SECRET` and your real `PAYMENT_MTN_RECIPIENT` and `PAYMENT_ORANGE_RECIPIENT` values in `server/.env`. These recipient details are shown to signed-in customers after they reserve dates. The existing example JWT secret is for local development only and should be replaced.

Create the first admin after filling the `ADMIN_*` values in `server/.env`:

```bash
cd server
npm run create-admin
```

Start the React client in another terminal:

```bash
cd client
npm install
npm run dev
```

The client is served at `http://localhost:5173` and the API at `http://localhost:5000`.

## Payment Workflow

1. A customer reserves dates; the server calculates and stores the XAF total.
2. The booking is held for 30 minutes while payment details are submitted.
3. The customer sends money through MTN MoMo or Orange Money outside the app, then supplies their Cameroon phone number and transaction reference.
4. The booking enters payment review. An admin marks it paid to confirm it, or rejects it to release the dates.
5. Customers may cancel before check-in. A paid cancellation becomes `refund_review` for manual staff handling.

This project intentionally does not connect to a live payment gateway, collect card data, issue automatic refunds, or move money.

## Useful Server Scripts

```bash
npm run seed             # Replace room inventory with starter Cameroon rooms
npm run create-admin     # Create or update the administrator from ADMIN_* variables
npm run migrate-bookings # Convert legacy pending bookings to awaiting_payment
```

## API Routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/rooms`, `GET /api/rooms/:id`, plus admin create, update, and delete routes
- `POST /api/bookings`, `GET /api/bookings/my`, `POST /api/bookings/:id/cancel`
- `POST /api/bookings/:id/payment` submits manual payment proof
- `PATCH /api/bookings/:id/payment` lets admins mark a payment `paid` or `rejected`
- `GET /api/bookings` lets admins view all bookings and payment details
