const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');

dotenv.config({ quiet: true });

const migrateBookings = async () => {
  await connectDB();
  const paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const result = await Booking.updateMany(
    { status: 'pending' },
    { $set: { status: 'awaiting_payment', paymentExpiresAt } }
  );
  console.log(`Migrated ${result.modifiedCount} pending booking(s)`);
};

migrateBookings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Booking migration error:', error.message);
    process.exit(1);
  });
