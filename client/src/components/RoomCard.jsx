import { BedDouble, MapPin, UsersRound } from 'lucide-react';
import { formatPrice } from '../utils/formatters.js';

function RoomCard({ isAuthenticated, onBook, room }) {
  return (
    <article className="room-card">
      <div className="room-image" style={{ backgroundImage: `url(${room.image})` }} />
      <div className="room-card-body">
        <div>
          <p className="eyebrow">{room.type}</p>
          <h3>{room.name}</h3>
          <p>{room.description}</p>
        </div>
        <div className="room-meta">
          <span>
            <MapPin aria-hidden="true" />
            {room.location}
          </span>
          <span>
            <UsersRound aria-hidden="true" />
            {room.guests} guests
          </span>
          <span>
            <BedDouble aria-hidden="true" />
            {room.beds}
          </span>
        </div>
        <div className="room-footer">
          <div>
            <strong>{formatPrice(room.price)}</strong>
            <span> per night</span>
          </div>
          {onBook && (
            <button
              className="secondary-button compact"
              type="button"
              onClick={() => onBook(room)}
              disabled={!room.isAvailable}
            >
              {isAuthenticated ? 'Book room' : 'Login to book'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default RoomCard;
