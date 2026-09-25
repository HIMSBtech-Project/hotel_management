import { CalendarDays, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ location: '', checkIn: '', checkOut: '' });
  const today = new Date().toISOString().slice(0, 10);

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => value && params.set(key, value));
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <section className="home-layout">
      <div className="hero-copy">
        <p className="eyebrow">Cameroon stays, clearly arranged</p>
        <h1>Find the right room for your next stay.</h1>
        <p>Browse hotel rooms in Buea, Douala, and Yaounde, then reserve your dates in CFA francs.</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/rooms"><Search aria-hidden="true" />Explore rooms</Link>
          <Link className="secondary-button" to="/register">Create account</Link>
        </div>
      </div>

      <form className="search-panel" onSubmit={submitSearch}>
        <div className="panel-heading"><CalendarDays aria-hidden="true" /><div><h2>Plan your stay</h2><p>Search rooms by location and dates.</p></div></div>
        <label>Location<input type="text" placeholder="Buea, Douala, Yaounde..." value={search.location} onChange={(event) => setSearch({ ...search, location: event.target.value })} /></label>
        <div className="date-fields">
          <label>Check in<input type="date" min={today} value={search.checkIn} onChange={(event) => setSearch({ ...search, checkIn: event.target.value })} /></label>
          <label>Check out<input type="date" min={search.checkIn || today} value={search.checkOut} onChange={(event) => setSearch({ ...search, checkOut: event.target.value })} /></label>
        </div>
        <button className="primary-button" type="submit"><Search aria-hidden="true" />Search rooms</button>
      </form>

      <div className="feature-row">
        <span><ShieldCheck aria-hidden="true" />Secure account access</span>
        <span><CalendarDays aria-hidden="true" />Dates held while you pay</span>
        <span><Search aria-hidden="true" />Prices shown in CFA</span>
      </div>
    </section>
  );
}

export default Home;
