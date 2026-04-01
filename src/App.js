// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './components/Register';
import ProfileForm from './components/ProfileForm';
import StudentDashboard from './components/StudentDashboard';
import ClubOfficerDashboard from './components/ClubOfficerDashboard';
import ClubDirectory from './components/ClubDirectory';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
            <NavLink to="/directory" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Club Directory</NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Register</NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Student Profile</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Student Dashboard</NavLink>
            <NavLink to="/officer-dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Officer Dashboard</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/directory" element={<ClubDirectory />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/officer-dashboard" element={<ClubOfficerDashboard />} />
          </Routes>
        </main>
      </div>
      <Chatbot />
    </Router>
  );
}

export default App;