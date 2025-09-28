// src/components/ClubDirectory.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicationForm from './ApplicationForm'; // We'll create this next
import './ClubDirectory.css';

const ClubDirectory = () => {
    const [allClubs, setAllClubs] = useState([]);
    const [filteredClubs, setFilteredClubs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for the modal form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState(null);

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/clubs');
                setAllClubs(response.data);
                setFilteredClubs(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch clubs. Is the backend running?');
                setLoading(false);
                console.error(err);
            }
        };
        fetchClubs();
    }, []);

    useEffect(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        let newFilteredClubs = allClubs.filter(club =>
            club.name.toLowerCase().includes(lowerCaseSearch) ||
            club.description.toLowerCase().includes(lowerCaseSearch)
        );
        if (selectedTag !== 'All') {
            newFilteredClubs = newFilteredClubs.filter(club => 
                club.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
            );
        }
        setFilteredClubs(newFilteredClubs);
    }, [searchTerm, selectedTag, allClubs]);

    const handleTagFilter = (tag) => {
        setSelectedTag(tag);
    };

    const openApplicationForm = (club) => {
        setSelectedClub(club);
        setIsFormOpen(true);
    };

    const closeApplicationForm = () => {
        setIsFormOpen(false);
        setSelectedClub(null);
    };

    if (loading) return <div className="loading">Loading club directory...</div>;
    if (error) return <div className="error">{error}</div>;

    const categories = ['All', 'Technical', 'Non-Tech', 'Arts', 'Leadership'];

    return (
        <div className="directory-container">
            <h1 className="directory-title">Club Directory</h1>
            <p className="directory-subtitle">Explore and find the perfect club for you.</p>

            <div className="search-and-filter">
                <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <div className="category-buttons">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-button ${selectedTag === cat ? 'active' : ''}`}
                            onClick={() => handleTagFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="club-list-grid">
                {filteredClubs.length > 0 ? (
                    filteredClubs.map(club => (
                        <div key={club.id} className="club-card">
                            <div className="card-header">
                                <h3 className="card-name">{club.name}</h3>
                                <span className={`status-badge ${club.is_recruiting ? 'recruiting' : 'not-recruiting'}`}>
                                    {club.is_recruiting ? 'Recruiting' : 'Not Recruiting'}
                                </span>
                            </div>
                            <p className="card-description">{club.description}</p>
                            <div className="card-details">
                                <p><strong>Members:</strong> {club.total_members}</p>
                                <p><strong>Open Positions:</strong> {club.open_positions.join(', ')}</p>
                                <p><strong>Skills:</strong> {club.skills_required.join(', ')}</p>
                                <p><strong>Interview Date:</strong> {club.interview_date ? new Date(club.interview_date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="card-tags">
                                {club.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            {club.is_recruiting && (
                                <button 
                                    className="apply-button"
                                    onClick={() => openApplicationForm(club)}
                                >
                                    Apply Now
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No clubs match your search or filter.</p>
                )}
            </div>
            
            {isFormOpen && selectedClub && (
                <ApplicationForm club={selectedClub} onClose={closeApplicationForm} />
            )}
        </div>
    );
};

export default ClubDirectory;