import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CircleUserRound, Hotel, Plus } from 'lucide-react';
import API from '../api/axios.js';
import { formatDate, formatPrice } from '../utils/formatters.js';

const emptyRoomForm = {
  name: '',
  type: 'Standard',
  location: 'Buea',
  guests: 1,
  beds: '',
  price: 50000,
  description: '',
  image: '',
  isAvailable: true,
};

function Dashboard({ profile }) {
  const [account, setAccount] = useState(profile.user);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [editingRoomId, setEditingRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = account?.role === 'admin';

  const loadDashboard = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const [{ data: profileData }, { data: roomData }] = await Promise.all([
        API.get('/auth/me'),
        API.get('/rooms'),
      ]);

      setAccount(profileData.user);
      setRooms(roomData.rooms);

      const bookingPath = profileData.user.role === 'admin' ? '/bookings' : '/bookings/my';
      const { data: bookingData } = await API.get(bookingPath);
      setBookings(bookingData.bookings);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const bookingTotal = useMemo(() => {
    return bookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);
  }, [bookings]);

  const updateRoomForm = (event) => {
    const { checked, name, type, value } = event.target;
    setRoomForm({
      ...roomForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetRoomForm = () => {
    setRoomForm(emptyRoomForm);
    setEditingRoomId('');
  };

  const editRoom = (room) => {
    setEditingRoomId(room._id);
    setRoomForm({
      name: room.name,
      type: room.type,
      location: room.location,
      guests: room.guests,
      beds: room.beds,
      price: room.price,
      description: room.description,
      image: room.image,
      isAvailable: room.isAvailable,
    });
  };

  const saveRoom = async (event) => {
    event.preventDefault();
    setMessage('');

    const payload = {
      ...roomForm,
      guests: Number(roomForm.guests),
      price: Number(roomForm.price),
    };

    try {
      if (editingRoomId) {
        await API.put(`/rooms/${editingRoomId}`, payload);
        setMessage('Room updated.');
      } else {
        await API.post('/rooms', payload);
        setMessage('Room created.');
      }

      resetRoomForm();
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save room.');
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await API.delete(`/rooms/${roomId}`);
      setMessage('Room deleted.');
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not delete room.');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await API.patch(`/bookings/${bookingId}/status`, { status });
      setMessage('Booking status updated.');
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update booking status.');
    }
  };

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">{isAdmin ? 'Admin dashboard' : 'Customer dashboard'}</p>
        <h1>Hello, {account?.name || 'guest'}</h1>
        <p>
          {isAdmin
            ? 'Manage room inventory and booking requests.'
            : 'View your profile and booking history.'}
        </p>
      </div>

      {message && <p className="form-message">{message}</p>}

      <div className="dashboard-grid">
        <article className="info-panel">
          <CircleUserRound aria-hidden="true" />
          <h2>Profile</h2>
          <p>{account?.email}</p>
          <span className="status-pill">{account?.role}</span>
        </article>
        <article className="info-panel">
          <CalendarCheck aria-hidden="true" />
          <h2>Bookings</h2>
          <p>
            {bookings.length} booking{bookings.length === 1 ? '' : 's'} · {formatPrice(bookingTotal)}
          </p>
          <span className="status-pill">{isLoading ? 'Loading' : 'Synced'}</span>
        </article>
      </div>

      {isAdmin && (
        <section className="dashboard-section">
          <div className="section-heading">
            <p className="eyebrow">Room management</p>
            <h2>{editingRoomId ? 'Edit room' : 'Create room'}</h2>
          </div>

          <form className="admin-form" onSubmit={saveRoom}>
            <label>
              Name
              <input name="name" value={roomForm.name} onChange={updateRoomForm} required />
            </label>
            <label>
              Type
              <select name="type" value={roomForm.type} onChange={updateRoomForm}>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </label>
            <label>
              Location
              <input name="location" value={roomForm.location} onChange={updateRoomForm} required />
            </label>
            <label>
              Guests
              <input
                name="guests"
                type="number"
                min="1"
                value={roomForm.guests}
                onChange={updateRoomForm}
                required
              />
            </label>
            <label>
              Beds
              <input name="beds" value={roomForm.beds} onChange={updateRoomForm} required />
            </label>
            <label>
              Price XAF
              <input
                name="price"
                type="number"
                min="0"
                value={roomForm.price}
                onChange={updateRoomForm}
                required
              />
            </label>
            <label className="wide-field">
              Image URL
              <input name="image" value={roomForm.image} onChange={updateRoomForm} required />
            </label>
            <label className="wide-field">
              Description
              <textarea
                name="description"
                value={roomForm.description}
                onChange={updateRoomForm}
                required
              />
            </label>
            <label className="checkbox-field">
              <input
                name="isAvailable"
                type="checkbox"
                checked={roomForm.isAvailable}
                onChange={updateRoomForm}
              />
              Available
            </label>
            <div className="button-row wide-field">
              <button className="primary-button" type="submit">
                <Plus aria-hidden="true" />
                {editingRoomId ? 'Update room' : 'Create room'}
              </button>
              {editingRoomId && (
                <button className="secondary-button" type="button" onClick={resetRoomForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            {rooms.map((room) => (
              <article className="admin-list-item" key={room._id}>
                <Hotel aria-hidden="true" />
                <div>
                  <h3>{room.name}</h3>
                  <p>
                    {room.location} · {room.type} · {formatPrice(room.price)}
                  </p>
                </div>
                <div className="button-row">
                  <button className="secondary-button compact" type="button" onClick={() => editRoom(room)}>
                    Edit
                  </button>
                  <button className="danger-button compact" type="button" onClick={() => deleteRoom(room._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <div className="section-heading">
          <p className="eyebrow">{isAdmin ? 'All bookings' : 'My bookings'}</p>
          <h2>Booking history</h2>
        </div>

        {bookings.length > 0 ? (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-row" key={booking._id}>
                <div>
                  <h3>{booking.room?.name || 'Room removed'}</h3>
                  <p>
                    {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)} · {booking.guests}{' '}
                    guest{booking.guests === 1 ? '' : 's'}
                  </p>
                  {isAdmin && booking.user && <p>{booking.user.name} · {booking.user.email}</p>}
                </div>
                <strong>{formatPrice(booking.totalPrice)}</strong>
                {isAdmin ? (
                  <select
                    value={booking.status}
                    onChange={(event) => updateBookingStatus(booking._id, event.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                ) : (
                  <span className="status-pill">{booking.status}</span>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No bookings yet</h2>
            <p>{isAdmin ? 'Booking requests will appear here.' : 'Book a room to see it here.'}</p>
          </div>
        )}
      </section>
    </section>
  );
}

export default Dashboard;
