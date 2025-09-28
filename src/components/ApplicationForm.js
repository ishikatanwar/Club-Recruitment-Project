// src/components/ApplicationForm.js

import React, { useState } from 'react';
import axios from 'axios';
import './ApplicationForm.css';

const ApplicationForm = ({ club, onClose }) => {
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    // A placeholder for the user ID. This would normally come from a logged-in user's state.
    const studentId = 1;

    const handleApplicationSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://127.0.0.1:5000/apply/${studentId}/${club.id}`);
            setMessage(response.data.message);
            setIsSuccess(true);
        } catch (error) {
            setMessage(error.response.data.message || 'An error occurred during application.');
            setIsSuccess(false);
        }
    };

    return (
        <div className="application-modal-overlay">
            <div className="application-modal-content">
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h3>Apply for {club.name}</h3>
                <form onSubmit={handleApplicationSubmit}>
                    <p>Submitting your application for {club.name}.</p>
                    <button type="submit" className="submit-button">Confirm Application</button>
                </form>
                {message && (
                    <p className={isSuccess ? 'success-message' : 'error-message'}>{message}</p>
                )}
            </div>
        </div>
    );
};

export default ApplicationForm;