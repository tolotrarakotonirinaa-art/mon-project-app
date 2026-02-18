import React from 'react';

const StatCard = ({ icon, value, label, color = 'primary' }) => {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${color}`}>
                <i className={`fas fa-${icon}`}></i>
            </div>
            <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
};

export default StatCard;