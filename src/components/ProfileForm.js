// src/components/ProfileForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileForm.css';

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        major: '',
        interests: '',
        skills: '',
        resume: '',
        personal_details: ''
    });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submittedProfileData, setSubmittedProfileData] = useState(null); // State for displaying saved data

    // A placeholder for the user ID. This would normally come from a logged-in user's state.
    const userId = 1;

    // Function to fetch and update the form data and the displayed profile data
    const fetchAndSetProfileData = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/user/profile/${userId}`);
            const profileData = response.data;
            setFormData({
                major: profileData.major || '',
                interests: profileData.interests || '',
                skills: profileData.skills || '',
                resume: profileData.resume || '',
                personal_details: profileData.personal_details || ''
            });
            setSubmittedProfileData(profileData); // Also save for display
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };

    // Fetch existing profile data on component load
    useEffect(() => {
        fetchAndSetProfileData();
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:5000/profile/${userId}`, formData);
            setMessage('Profile updated successfully! 🎉');
            setIsSuccess(true);
            
            // Fetch the newly updated data to display it
            fetchAndSetProfileData();

        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
            setIsSuccess(false);
            console.error('There was an error updating the profile!', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="form-container">
            <h2>Complete Your Profile</h2>
            <p>Tell us about yourself to get personalized club recommendations!</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="major">Major:</label>
                    <input type="text" id="major" name="major" value={formData.major} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="interests">Interests (comma-separated):</label>
                    <input type="text" id="interests" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., AI, Robotics, Gaming" required />
                </div>
                <div className="form-group">
                    <label htmlFor="skills">Skills (comma-separated):</label>
                    <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., Python, JavaScript, Public Speaking" required />
                </div>
                <div className="form-group">
                    <label htmlFor="resume">Resume (Link):</label>
                    <input type="url" id="resume" name="resume" value={formData.resume} onChange={handleChange} placeholder="e.g., http://your-resume-link.com" />
                </div>
                <div className="form-group">
                    <label htmlFor="personal_details">Tell us a bit about yourself:</label>
                    <textarea id="personal_details" name="personal_details" value={formData.personal_details} onChange={handleChange} rows="4" placeholder="e.g., 'I am a passionate computer science student with a strong interest in robotics and AI.'"></textarea>
                </div>
                <button type="submit" className="submit-button">Save Profile</button>
            </form>
            {message && <p className={isSuccess ? 'success-message' : 'error-message'}>{message}</p>}

            {/* NEW: Section to display the saved profile data */}
            {submittedProfileData && (
                <div className="saved-profile-data">
                    <h3>Your Saved Profile:</h3>
                    <p><strong>Major:</strong> {submittedProfileData.major || 'N/A'}</p>
                    <p><strong>Interests:</strong> {submittedProfileData.interests || 'N/A'}</p>
                    <p><strong>Skills:</strong> {submittedProfileData.skills || 'N/A'}</p>
                    <p><strong>Resume:</strong> {submittedProfileData.resume ? <a href={submittedProfileData.resume} target="_blank" rel="noopener noreferrer">View Resume</a> : 'N/A'}</p>
                    <p><strong>Personal Details:</strong> {submittedProfileData.personal_details || 'N/A'}</p>
                </div>
            )}
        </div>
    );
};

export default ProfileForm;
