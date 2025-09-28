// src/components/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'student'
    });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null); // New state to hold user data

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/register', formData);
            setMessage(response.data.message);
            setIsSuccess(true);
            
            // On successful registration, save the form data and display the dashboard
            setRegisteredUser({
                username: formData.username,
                full_name: formData.full_name,
                email: formData.email,
                role: formData.role
            });

        } catch (error) {
            setMessage('Registration failed. Please try again.');
            setIsSuccess(false);
            console.error('Registration error:', error);
        }
    };

    // Conditional rendering: show details if user is registered, otherwise show form
    if (registeredUser) {
        return (
            <div className="registration-details-container">
                <h3>Registration Successful! 🎉</h3>
                <p>Your account has been created. Here are your details:</p>
                <div className="details-card">
                    <p><strong>Name:</strong> {registeredUser.full_name}</p>
                    <p><strong>Email:</strong> {registeredUser.email}</p>
                    <p><strong>Username:</strong> {registeredUser.username}</p>
                    <p><strong>Account Type:</strong> {registeredUser.role}</p>
                </div>
                <p className="next-step-message">Now you can complete your profile or explore clubs!</p>
            </div>
        );
    }

    // Default: show the registration form
    return (
        <div className="register-container">
            <h2>Create an Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="full_name">Full Name:</label>
                    <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Account Type:</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange}>
                        <option value="student">Student</option>
                        <option value="coordinator">Club Coordinator</option>
                    </select>
                </div>
                <button type="submit" className="submit-button">Register</button>
            </form>
            {message && <p className={isSuccess ? 'success-message' : 'error-message'}>{message}</p>}
        </div>
    );
};

export default Register;