import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios.js';
import PaymentPanel from '../components/PaymentPanel.jsx';
import RoomCard from '../components/RoomCard.jsx';
import { formatPrice } from '../utils/formatters.js';

const initialBooking = { room: '', checkIn: '', checkOut: '', guests: 1 };

function Rooms({ profile }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ search: searchParams.get('location') || '', type: '' });
  const [booking, setBooking] = useState({ ...initialBooking, checkIn: searchParams.get('checkIn') || '', checkOut: searchParams.get('checkOut') || '' });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const loadRooms = async (nextFilters = filters) => {
    setIsLoading(true);
    setMessage('');
    try {
      const params = {};
      if (nextFilters.search) params.search = nextFilters.search;
      if (nextFilters.type) params.type = nextFilters.type;
      const { data } = await API.get('/rooms', { params });
      setRooms(data.rooms);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load rooms.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const openBooking = (room) => {
    setSelectedRoom(room);
    setCreatedBooking(null);
    setBooking((current) => ({ ...current, room: room._id, guests: 1 }));
    setMessage('');
  };

  const closeBooking = () => {
    setSelectedRoom(null);
    setCreatedBooking(null);
    setBooking(initialBooking);
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const { data } = await API.post('/bookings', booking);
      setCreatedBooking(data.booking);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not reserve this room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="section-heading"><p className="eyebrow">Cameroon hotel collection</p><h1>Choose your room</h1><p>Every total is calculated in CFA francs by the booking service.</p></div>
      <form className="filter-bar" onSubmit={(event) => { event.preventDefault(); setSearchParams(filters.search ? { location: filters.search } : {}); loadRooms(); }}>
        <input name="search" type="search" placeholder="Search Buea, suite, garden..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <select name="type" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">All room types</option><option value="Standard">Standard</option><option value="Deluxe">Deluxe</option><option value="Suite">Suite</option></select>
        <button className="primary-button" type="submit">Search</button>
      </form>
      {message && <p className="form-message">{message}</p>}
      {selectedRoom && !createdBooking && <form className="booking-panel" onSubmit={handleBookingSubmit}>
        <div className="booking-summary"><p className="eyebrow">Reserve dates</p><h2>{selectedRoom.name}</h2><p>{formatPrice(selectedRoom.price)} per night</p></div>
        <label>Check in<input name="checkIn" type="date" min={today} value={booking.checkIn} onChange={(event) => setBooking({ ...booking, checkIn: event.target.value })} required /></label>
        <label>Check out<input name="checkOut" type="date" min={booking.checkIn || today} value={booking.checkOut} onChange={(event) => setBooking({ ...booking, checkOut: event.target.value })} required /></label>
        <label>Guests<input name="guests" type="number" min="1" max={selectedRoom.guests} value={booking.guests} onChange={(event) => setBooking({ ...booking, guests: event.target.value })} required /></label>
        <div className="button-row"><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Reserving...' : 'Reserve dates'}</button><button className="secondary-button" type="button" onClick={closeBooking}>Close</button></div>
      </form>}
      {createdBooking && <PaymentPanel booking={createdBooking} onComplete={() => { setMessage('Payment details submitted. Your booking is awaiting hotel verification.'); closeBooking(); }} />}
      {isLoading ? <p className="loading-copy">Loading rooms...</p> : rooms.length > 0 ? <div className="room-grid">{rooms.map((room) => <RoomCard key={room._id} room={room} isAuthenticated={Boolean(profile)} onBook={profile ? openBooking : () => setMessage('Please login before booking a room.')} />)}</div> : <div className="empty-state"><h2>No rooms found</h2><p>Try another location or room type.</p>{!profile && <Link to="/login">Login to reserve a room</Link>}</div>}
    </section>
  );
}

export default Rooms;
