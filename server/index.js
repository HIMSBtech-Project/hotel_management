const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');

dotenv.config({ quiet: true });

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN || 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://hotel-management-six-phi.vercel.app/', 'https://hotel-reservation-server-r1ev.onrender.com/'],
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('HotelReserve API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HotelReserve API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
