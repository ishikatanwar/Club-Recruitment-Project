// src/components/ClubOfficerDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClubOfficerDashboard.css';

const ClubOfficerDashboard = () => {
    const [club, setClub] = useState(null);
    const [events, setEvents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [selectedEventName, setSelectedEventName] = useState('');

    // A placeholder for the coordinator ID. This would be from a logged-in user's state.
    const coordinatorId = 2; // Assuming Jane Coordinator has user_id 2

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch the club data associated with the coordinator ID
                const clubResponse = await axios.get(`http://127.0.0.1:5000/clubs/coordinator/${coordinatorId}`);
                const fetchedClub = clubResponse.data;
                setClub(fetchedClub);

                // Fetch events for that club
                const eventsResponse = await axios.get(`http://127.0.0.1:5000/clubs/${fetchedClub.id}/events`);
                setEvents(eventsResponse.data.events);

                // Fetch applications for that club
                const applicationsResponse = await axios.get(`http://127.0.0.1:5000/applications/club/${fetchedClub.id}`);
                setApplications(applicationsResponse.data);

                // Fetch feedback for that club
                const feedbackResponse = await axios.get(`http://127.0.0.1:5000/feedback/club/${fetchedClub.id}`);
                setFeedback(feedbackResponse.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch dashboard data. Is the backend running?');
                setLoading(false);
                console.error(err);
            }
        };

        fetchDashboardData();
    }, [coordinatorId]);

    const handleShowQrCode = async (eventId, eventName) => {
        setQrCode(null); // Clear previous QR code
        setSelectedEventName(eventName);
        try {
            const response = await axios.get(`http://127.0.0.1:5000/generate_qr/${eventId}`);
            setQrCode(response.data.image_base64);
        } catch (err) {
            console.error('Failed to generate QR code.', err);
            setQrCode('error');
        }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="officer-dashboard-container">
            <h1 className="officer-dashboard-title">Welcome, {club.name} Coordinator!</h1>
            <p className="officer-dashboard-subtitle">Manage your club's recruitment, events, and member engagement.</p>

            <div className="dashboard-grid">
                {/* Events Management Section */}
                <div className="dashboard-card events-card">
                    <h3>Events Management</h3>
                    {events.length > 0 ? (
                        <div className="events-list">
                            {events.map(event => (
                                <div key={event.id} className="event-item">
                                    <div className="event-details">
                                        <h4>{event.name}</h4>
                                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                                        <p><strong>Location:</strong> {event.location}</p>
                                    </div>
                                    <button
                                        className="qr-button"
                                        onClick={() => handleShowQrCode(event.id, event.name)}>
                                        Show QR Code
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No events found. Add one to get started!</p>
                    )}
                </div>

                {/* Student Applications Section */}
                <div className="dashboard-card applications-card">
                    <h3>Student Applications</h3>
                    {applications.length > 0 ? (
                        <ul className="apps-list">
                            {applications.map(app => (
                                <li key={app.id}>
                                    <strong>{app.student_name}</strong> - Status: <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No new applications at the moment.</p>
                    )}
                </div>

                {/* Member Feedback Section */}
                <div className="dashboard-card feedback-card">
                    <h3>Member Feedback</h3>
                    {feedback.length > 0 ? (
                        <ul className="feedback-list">
                            {feedback.map(entry => (
                                <li key={entry.id}>
                                    <strong>{entry.student_name}</strong> gave a rating of <strong>{entry.rating}/5</strong>
                                    <p className="feedback-comment">{entry.comment}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No feedback from members yet.</p>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            {qrCode && (
                <div className="qr-modal">
                    <div className="qr-modal-content">
                        <h4>QR Code for **{selectedEventName}**</h4>
                        {qrCode === 'error' ? (
                            <p className="error">Failed to load QR code.</p>
                        ) : (
                            <>
                                <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
                                <p className="qr-instruction">Students can scan this to check in!</p>
                            </>
                        )}
                        <button className="close-button" onClick={() => setQrCode(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClubOfficerDashboard;