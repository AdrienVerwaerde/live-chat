// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './App.css';

import Register from './pages/register/Register';
import Login from './pages/login/Login';
import Chat from './pages/chat/Chat';   
import ProtectedRoute from './utils/ProtectedRoute';

const socket = io('http://localhost:4001');

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  return (
    <Router>
<nav className="navbar">
        {!isAuthenticated && <Link to="/register">Register</Link>}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {isAuthenticated && <Link to="/chat">Chat</Link>}
        {isAuthenticated && (
          <a onClick={handleLogout} className="logout-button">
            Logout
          </a>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
