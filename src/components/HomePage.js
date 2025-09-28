// src/components/HomePage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [buzz, setBuzz] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all clubs
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/clubs');
                setClubs(response.data);
            } catch (err) {
                setError('Failed to fetch clubs. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };
        fetchClubs();
    }, []);

    // Fetch events and buzz data periodically
    useEffect(() => {
        const fetchDynamicData = async () => {
            try {
                const eventsResponse = await axios.get('http://127.0.0.1:5000/events');
                setEvents(eventsResponse.data);

                const buzzResponse = await axios.get('http://127.0.0.1:5000/buzz');
                setBuzz(buzzResponse.data.buzz_data);
            } catch (err) {
                console.error("Error fetching dynamic data:", err);
            }
        };
        
        fetchDynamicData(); // Initial fetch
        const interval = setInterval(fetchDynamicData, 60000); // Fetch every 60 seconds
        return () => clearInterval(interval); // Cleanup
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home-container">
            <h1 className="main-title">Discover College Clubs</h1>
            <p className="subtitle">Find your passion, join a community.</p>

            {/* Real-time Buzz Map Section */}
            <div className="buzz-map-section">
                <h2 className="buzz-title">Campus Buzz: Most Active Clubs Right Now 🔥</h2>
                {buzz.length > 0 ? (
                    <div className="buzz-list">
                        {buzz.map((item, index) => (
                            <div key={index} className="buzz-item">
                                <span className="buzz-rank">{index + 1}.</span>
                                <span className="buzz-club-name">{item.club_name}</span>
                                <span className="buzz-score">{item.buzz_score} check-ins</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No recent activity. Check in at a club event to add some buzz!</p>
                )}
            </div>
            
            {/* Upcoming Events Section */}
            <div className="events-section">
                <h2 className="events-title">Upcoming Events</h2>
                {events.length > 0 ? (
                    <div className="events-grid">
                        {events.map(event => (
                            <div key={event.id} className="event-card">
                                <h3 className="event-name">{event.name}</h3>
                                <p className="event-club-name">by {event.club_name}</p>
                                <p className="event-details">
                                    <span role="img" aria-label="date">📅</span> {new Date(event.date).toLocaleDateString()}
                                    <span className="separator">|</span>
                                    <span role="img" aria-label="location">📍</span> {event.location}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No upcoming events at the moment.</p>
                )}
            </div>

            {/* All Clubs Section */}
            <div className="clubs-section">
                <h2 className="clubs-title">All Clubs</h2>
                <div className="clubs-grid">
                    {clubs.length > 0 ? (
                        clubs.map((club, index) => (
                            <div key={club.id} className={`club-card color-${(index % 6) + 1}`}>
                                <h3 className="club-name">{club.name}</h3>
                                <p className="club-description">{club.description}</p>
                                <div className="club-tags">
                                    {club.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No clubs found. Add some from the backend!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;