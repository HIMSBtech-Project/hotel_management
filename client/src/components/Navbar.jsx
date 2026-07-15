import { Hotel, LogOut, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

function Navbar({ profile, onLogout }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <Hotel aria-hidden="true" />
        <span>NM HotelReserve</span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/rooms">Rooms</NavLink>
        {profile ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <button className="ghost-button" type="button" onClick={onLogout}>
              <LogOut aria-hidden="true" />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <Link className="primary-button compact" to="/register">
              <UserRound aria-hidden="true" />
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
