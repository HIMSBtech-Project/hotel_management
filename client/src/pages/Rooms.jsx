import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios.js';
import RoomCard from '../components/RoomCard.jsx';
import { formatPrice } from '../utils/formatters.js';

const initialBooking = {
  room: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
};

function Rooms({ profile }) {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '' });
  const [booking, setBooking] = useState(initialBooking);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRooms = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;

      const { data } = await API.get('/rooms', { params });
      setRooms(data.rooms);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load rooms.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const updateFilter = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const updateBooking = (event) => {
    setBooking({ ...booking, [event.target.name]: event.target.value });
  };

  const openBooking = (room) => {
    setSelectedRoom(room);
    setBooking({ ...initialBooking, room: room._id, guests: 1 });
    setMessage('');
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    loadRooms();
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!profile) {
      setMessage('Please login before booking a room.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await API.post('/bookings', booking);
      setMessage('Booking created. You can view it in your dashboard.');
      setSelectedRoom(null);
      setBooking(initialBooking);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Live inventory</p>
        <h1>Available rooms</h1>
        <p>Browse Cameroon rooms from MongoDB and book available dates.</p>
      </div>

      <form className="filter-bar" onSubmit={handleFilterSubmit}>
        <input
          name="search"
          type="search"
          placeholder="Search by Buea, suite, garden..."
          value={filters.search}
          onChange={updateFilter}
        />
        <select name="type" value={filters.type} onChange={updateFilter}>
          <option value="">All room types</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      {selectedRoom && (
        <form className="booking-panel" onSubmit={handleBookingSubmit}>
          <div>
            <p className="eyebrow">Booking request</p>
            <h2>{selectedRoom.name}</h2>
            <p>{formatPrice(selectedRoom.price)} per night</p>
          </div>
          <label>
            Check in
            <input
              name="checkIn"
              type="date"
              value={booking.checkIn}
              onChange={updateBooking}
              required
            />
          </label>
          <label>
            Check out
            <input
              name="checkOut"
              type="date"
              value={booking.checkOut}
              onChange={updateBooking}
              required
            />
          </label>
          <label>
            Guests
            <input
              name="guests"
              type="number"
              min="1"
              max={selectedRoom.guests}
              value={booking.guests}
              onChange={updateBooking}
              required
            />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Confirm booking'}
            </button>
            <button className="secondary-button" type="button" onClick={() => setSelectedRoom(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p>Loading rooms...</p>
      ) : rooms.length > 0 ? (
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              isAuthenticated={Boolean(profile)}
              onBook={profile ? openBooking : () => setMessage('Please login before booking a room.')}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No rooms found</h2>
          <p>Run the seed script or adjust your filters.</p>
          {!profile && <Link to="/login">Login to book after rooms are available</Link>}
        </div>
      )}
    </section>
  );
}

export default Rooms;
