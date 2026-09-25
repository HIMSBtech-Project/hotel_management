import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CircleUserRound, Hotel, Plus } from 'lucide-react';
import API from '../api/axios.js';
import PaymentPanel from '../components/PaymentPanel.jsx';
import { formatDate, formatPrice } from '../utils/formatters.js';

const emptyRoomForm = { name: '', type: 'Standard', location: 'Buea', guests: 1, beds: '', price: 50000, description: '', image: '', isAvailable: true };
const paymentLabel = { awaiting_verification: 'Awaiting verification', paid: 'Paid', rejected: 'Rejected', refund_review: 'Refund review', cancelled: 'Cancelled' };

function Dashboard({ profile }) {
  const [account, setAccount] = useState(profile.user);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [editingRoomId, setEditingRoomId] = useState('');
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = account?.role === 'admin';

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [{ data: profileData }, { data: roomData }] = await Promise.all([API.get('/auth/me'), API.get('/rooms')]);
      setAccount(profileData.user);
      setRooms(roomData.rooms);
      const { data: bookingData } = await API.get(profileData.user.role === 'admin' ? '/bookings' : '/bookings/my');
      setBookings(bookingData.bookings);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load dashboard data.');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);
  const bookingTotal = useMemo(() => bookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0), [bookings]);

  const saveRoom = async (event) => {
    event.preventDefault();
    const payload = { ...roomForm, guests: Number(roomForm.guests), price: Number(roomForm.price) };
    try {
      await (editingRoomId ? API.put(`/rooms/${editingRoomId}`, payload) : API.post('/rooms', payload));
      setMessage(editingRoomId ? 'Room updated.' : 'Room created.');
      setRoomForm(emptyRoomForm); setEditingRoomId(''); loadDashboard();
    } catch (error) { setMessage(error.response?.data?.message || 'Could not save room.'); }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await API.post(`/bookings/${bookingId}/cancel`); setMessage('Booking cancelled.'); loadDashboard(); }
    catch (error) { setMessage(error.response?.data?.message || 'Could not cancel booking.'); }
  };

  const reviewPayment = async (bookingId, status) => {
    try { await API.patch(`/bookings/${bookingId}/payment`, { status }); setMessage(`Payment marked ${status}.`); loadDashboard(); }
    catch (error) { setMessage(error.response?.data?.message || 'Could not review payment.'); }
  };

  return (
    <section>
      <div className="section-heading"><p className="eyebrow">{isAdmin ? 'Hotel operations' : 'Your reservations'}</p><h1>Hello, {account?.name || 'guest'}</h1><p>{isAdmin ? 'Manage rooms, reservations, and payment reviews.' : 'Track reservations and submit or review payment details.'}</p></div>
      {message && <p className="form-message">{message}</p>}
      <div className="dashboard-grid">
        <article className="info-panel"><CircleUserRound aria-hidden="true" /><h2>Account</h2><p>{account?.email}</p><span className="status-pill">{account?.role}</span></article>
        <article className="info-panel"><CalendarCheck aria-hidden="true" /><h2>Booking value</h2><p>{formatPrice(bookingTotal)}</p><span className="status-pill">{isLoading ? 'Loading' : `${bookings.length} reservation${bookings.length === 1 ? '' : 's'}`}</span></article>
      </div>

      {!isAdmin && activePaymentBooking && <PaymentPanel booking={activePaymentBooking} onComplete={() => { setActivePaymentBooking(null); setMessage('Payment details submitted for verification.'); loadDashboard(); }} />}

      {isAdmin && <section className="dashboard-section">
        <div className="section-heading"><p className="eyebrow">Room management</p><h2>{editingRoomId ? 'Edit room' : 'Add a room'}</h2></div>
        <form className="admin-form" onSubmit={saveRoom}>
          <label>Name<input name="name" value={roomForm.name} onChange={(event) => setRoomForm({ ...roomForm, name: event.target.value })} required /></label>
          <label>Type<select name="type" value={roomForm.type} onChange={(event) => setRoomForm({ ...roomForm, type: event.target.value })}><option>Standard</option><option>Deluxe</option><option>Suite</option></select></label>
          <label>Location<input name="location" value={roomForm.location} onChange={(event) => setRoomForm({ ...roomForm, location: event.target.value })} required /></label>
          <label>Guests<input name="guests" type="number" min="1" value={roomForm.guests} onChange={(event) => setRoomForm({ ...roomForm, guests: event.target.value })} required /></label>
          <label>Beds<input name="beds" value={roomForm.beds} onChange={(event) => setRoomForm({ ...roomForm, beds: event.target.value })} required /></label>
          <label>Price (XAF)<input name="price" type="number" min="0" value={roomForm.price} onChange={(event) => setRoomForm({ ...roomForm, price: event.target.value })} required /></label>
          <label className="wide-field">Image URL<input name="image" value={roomForm.image} onChange={(event) => setRoomForm({ ...roomForm, image: event.target.value })} required /></label>
          <label className="wide-field">Description<textarea name="description" value={roomForm.description} onChange={(event) => setRoomForm({ ...roomForm, description: event.target.value })} required /></label>
          <label className="checkbox-field"><input type="checkbox" checked={roomForm.isAvailable} onChange={(event) => setRoomForm({ ...roomForm, isAvailable: event.target.checked })} />Available</label>
          <div className="button-row wide-field"><button className="primary-button" type="submit"><Plus aria-hidden="true" />{editingRoomId ? 'Update room' : 'Create room'}</button>{editingRoomId && <button className="secondary-button" type="button" onClick={() => { setRoomForm(emptyRoomForm); setEditingRoomId(''); }}>Cancel edit</button>}</div>
        </form>
        <div className="admin-list">{rooms.map((room) => <article className="admin-list-item" key={room._id}><Hotel aria-hidden="true" /><div><h3>{room.name}</h3><p>{room.location} · {room.type} · {formatPrice(room.price)}</p></div><div className="button-row"><button className="secondary-button compact" type="button" onClick={() => { setEditingRoomId(room._id); setRoomForm(room); }}>Edit</button><button className="danger-button compact" type="button" onClick={async () => { if (window.confirm('Delete this room?')) { await API.delete(`/rooms/${room._id}`); loadDashboard(); } }}>Delete</button></div></article>)}</div>
      </section>}

      <section className="dashboard-section">
        <div className="section-heading"><p className="eyebrow">{isAdmin ? 'All reservations' : 'Booking history'}</p><h2>{isAdmin ? 'Reservations and payments' : 'Your bookings'}</h2></div>
        {bookings.length > 0 ? <div className="booking-list">{bookings.map((booking) => <article className="booking-row" key={booking._id}>
          <div><h3>{booking.room?.name || 'Room removed'}</h3><p>{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)} · {booking.guests} guest{booking.guests === 1 ? '' : 's'}</p>{isAdmin && booking.user && <p>{booking.user.name} · {booking.user.email}</p>}</div>
          <div><strong>{formatPrice(booking.totalPrice)}</strong><span className={`status-pill status-${booking.status}`}>{booking.status.replace('_', ' ')}</span>{booking.payment && <span className={`status-pill status-${booking.payment.status}`}>{paymentLabel[booking.payment.status]}</span>}</div>
          <div className="button-row">{isAdmin && booking.payment?.status === 'awaiting_verification' && <><button className="primary-button compact" type="button" onClick={() => reviewPayment(booking._id, 'paid')}>Mark paid</button><button className="danger-button compact" type="button" onClick={() => reviewPayment(booking._id, 'rejected')}>Reject</button></>}{!isAdmin && booking.status === 'awaiting_payment' && <button className="secondary-button compact" type="button" onClick={() => setActivePaymentBooking(booking)}>Submit payment</button>}{!isAdmin && booking.status !== 'cancelled' && <button className="danger-button compact" type="button" onClick={() => cancelBooking(booking._id)}>Cancel booking</button>}</div>
        </article>)}</div> : <div className="empty-state"><h2>No bookings yet</h2><p>{isAdmin ? 'Reservations will appear here.' : 'Reserve a room to see it here.'}</p></div>}
      </section>
    </section>
  );
}

export default Dashboard;
