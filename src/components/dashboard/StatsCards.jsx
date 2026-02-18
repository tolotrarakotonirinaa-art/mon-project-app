import React from 'react';

const StatsCards = ({ stats }) => {
    const cards = [
        { key: 'projects', label: 'Projets actifs', icon: 'project-diagram', color: 'projects' },
        { key: 'tasks', label: 'Tâches en cours', icon: 'tasks', color: 'tasks' },
        { key: 'users', label: 'Membres d\'équipe', icon: 'users', color: 'users' },
        { key: 'pipelines', label: 'Pipelines actifs', icon: 'stream', color: 'pipeline' }
    ];

    return (
        <div className="stats-cards">
            {cards.map(card => (
                <div key={card.key} className="stat-card">
                    <div className={`stat-icon ${card.color}`}>
                        <i className={`fas fa-${card.icon}`}></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats[card.key] || 0}</h3>
                        <p>{card.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;