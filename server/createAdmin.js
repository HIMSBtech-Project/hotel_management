const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config({ quiet: true });

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in server/.env');
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  await connectDB();

  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.trim().toLowerCase() },
    {
      name: ADMIN_NAME.trim(),
      email: ADMIN_EMAIL.trim().toLowerCase(),
      password,
      role: 'admin',
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account is ready for ${ADMIN_EMAIL}`);
};

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Create admin error:', error.message);
    process.exit(1);
  });
