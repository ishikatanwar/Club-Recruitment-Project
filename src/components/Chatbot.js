// src/components/Chatbot.js
import React, { useState } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (input.trim() === '') return;
        const userMessage = { text: input, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/chatbot', { message: input });
            const botMessage = { text: response.data.response, sender: 'bot' };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = { text: "Error connecting to the chatbot.", sender: 'bot' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    };

    return (
        <div className="chatbot-container">
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close Chat' : 'Chat with AI'}
            </button>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chat-header">Club Recruitment AI</div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your question..."
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;