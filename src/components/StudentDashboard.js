// src/components/StudentDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hardcoded placeholder for a user ID.
    const userId = 1;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user's profile
                const userResponse = await axios.get(`http://127.0.0.1:5000/user/profile/${userId}`);
                setUserData(userResponse.data);

                // Fetch club recommendations
                const recsResponse = await axios.get(`http://127.0.0.1:5000/recommendations/${userId}`);
                setRecommendations(recsResponse.data.recommendations);
                
                // Fetch applications
                const appsResponse = await axios.get(`http://127.0.0.1:5000/applications/${userId}`);
                setApplications(appsResponse.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to load dashboard data. Is the backend running?');
                setLoading(false);
                console.error(err);
            }
        };
        fetchDashboardData();
    }, [userId]);

    if (loading) return <div className="loading">Loading your personalized dashboard...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            {/* Welcome and Personal Details Section */}
            <div className="welcome-section dashboard-card">
                <h1 className="dashboard-title">Hello, {userData.full_name}! 👋</h1>
                <p className="dashboard-subtitle">Welcome to your personalized student hub.</p>
                <div className="profile-details-card">
                    <p><strong>Name:</strong> {userData.full_name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Major:</strong> {userData.major || 'N/A'}</p>
                    <p><strong>Interests:</strong> {userData.interests || 'N/A'}</p>
                    <p><strong>Skills:</strong> {userData.skills || 'N/A'}</p>
                </div>
            </div>

            <div className="profile-status-section">
                <h3>Profile Status: {userData.profile_complete ? 'Complete 🎉' : 'Incomplete ⚠️'}</h3>
                {!userData.profile_complete && (
                    <p>Your profile is incomplete. <NavLink to="/profile">Complete it now</NavLink> to get the best club recommendations!</p>
                )}
            </div>
            
            <div className="dashboard-grid">
                {/* Club Recommendations Section */}
                <div className="dashboard-card recommendations-card">
                    <h3>Recommended Clubs for You</h3>
                    {recommendations.length > 0 ? (
                        <ul className="recs-list">
                            {recommendations.map(club => (
                                <li key={club.id}>
                                    <strong>{club.name}</strong> - Match: {Math.round(club.score * 100)}%
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No recommendations yet. Update your <NavLink to="/profile">profile</NavLink> to get started!</p>
                    )}
                </div>
                
                {/* Application Status Section */}
                <div className="dashboard-card applications-card">
                    <h3>Your Applications</h3>
                    {applications.length > 0 ? (
                        <ul className="apps-list">
                            {applications.map(app => (
                                <li key={app.id}>
                                    <strong>{app.club_name}</strong>: <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You haven't applied to any clubs yet.</p>
                    )}
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="quick-actions-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                    <div className="action-item">
                        <h4>Interview Prep</h4>
                        <p>Practice common interview questions.</p>
                        <button className="action-button">Start Prep</button>
                    </div>
                    <div className="action-item">
                        <h4>Skill Assessment</h4>
                        <p>Test your knowledge in a specific area.</p>
                        <button className="action-button">Start Assessment</button>
                    </div>
                    <div className="action-item">
                        <h4>Mock Interview</h4>
                        <p>Get AI feedback on your interview skills.</p>
                        <button className="action-button">Start Mock Interview</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;