import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Rooms from './pages/Rooms.jsx';

function App() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('hotel_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleAuth = (authProfile) => {
    localStorage.setItem('hotel_profile', JSON.stringify(authProfile));
    setProfile(authProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem('hotel_profile');
    setProfile(null);
  };

  return (
    <div className="app-shell">
      <Navbar profile={profile} onLogout={handleLogout} />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms profile={profile} />} />
          <Route
            path="/login"
            element={profile ? <Navigate to="/dashboard" /> : <Login onAuth={handleAuth} />}
          />
          <Route
            path="/register"
            element={profile ? <Navigate to="/dashboard" /> : <Register onAuth={handleAuth} />}
          />
          <Route
            path="/dashboard"
            element={profile ? <Dashboard profile={profile} /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
