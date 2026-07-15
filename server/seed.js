const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Room = require('./models/Room');

dotenv.config({ quiet: true });

const rooms = [
  {
    name: 'Executive City Suite',
    type: 'Suite',
    location: 'Buea',
    guests: 2,
    beds: '1 king bed',
    price: 95000,
    description: 'A calm city-view suite with workspace, lounge area, and fast Wi-Fi.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
  },
  {
    name: 'Garden Deluxe Room',
    type: 'Deluxe',
    location: 'Douala',
    guests: 3,
    beds: '2 queen beds',
    price: 75000,
    description: 'Bright room with a garden-facing balcony and breakfast included.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
  },
  {
    name: 'Classic Business Room',
    type: 'Standard',
    location: 'Yaounde',
    guests: 2,
    beds: '1 queen bed',
    price: 50000,
    description: 'A practical room for short stays, close to business districts.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
  },
];

const seedRooms = async () => {
  try {
    await connectDB();
    await Room.deleteMany({});
    await Room.insertMany(rooms);
    console.log('Seeded Cameroon starter rooms');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedRooms();
