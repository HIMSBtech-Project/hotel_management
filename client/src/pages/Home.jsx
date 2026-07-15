import { CalendarDays, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="home-grid">
      <div className="hero-copy">
        <p className="eyebrow"> Hotel booking foundation</p>
        <h1>Find rooms, check availability, and manage hotel reservations.</h1>
        <p>
          HotelReserve gives guests a simple booking flow and gives staff a clean
          foundation for inventory, authentication, and future reservation tools.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" to="/rooms">
            <Search aria-hidden="true" />
            Browse rooms
          </Link>
          <Link className="secondary-button" to="/register">
            Create account
          </Link>
        </div>
      </div>

      <form className="search-panel">
        <label>
          Location
          <input type="text" placeholder="Buea, Douala, Yaounde..." />
        </label>
        <label>
          Check in
          <input type="date" />
        </label>
        <label>
          Check out
          <input type="date" />
        </label>
        <button className="primary-button" type="button">
          <CalendarDays aria-hidden="true" />
          Check availability
        </button>
      </form>

      <div className="feature-row">
        <span>
          <ShieldCheck aria-hidden="true" />
          JWT authentication
        </span>
        <span>
          <CalendarDays aria-hidden="true" />
          Booking-ready routes
        </span>
        <span>
          <Search aria-hidden="true" />
          Search-first UI
        </span>
      </div>
    </section>
  );
}

export default Home;
