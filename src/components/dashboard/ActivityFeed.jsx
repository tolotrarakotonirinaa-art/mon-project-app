import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const ActivityFeed = () => {
    const { activities } = useData();
    const { hasPermission } = useAuth();

    const handleClearActivities = () => {
        if (hasPermission('admin')) {
            // Logique pour effacer les activités
            alert('Activités effacées!');
        }
    };

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">Activité récente</h3>
                {hasPermission('admin') && (
                    <button className="btn btn-sm" onClick={handleClearActivities}>
                        Effacer
                    </button>
                )}
            </div>
            <div className="card-content">
                {activities.length === 0 ? (
                    <p className="text-muted">Aucune activité récente</p>
                ) : (
                    <ul className="activity-list">
                        {activities.map(activity => (
                            <li key={activity.id} className="activity-item">
                                <div className="activity-icon">
                                    <i className={`fas fa-${activity.icon}`}></i>
                                </div>
                                <div className="activity-content">
                                    <p><strong>{activity.user}</strong> {activity.action}</p>
                                    <div className="activity-time">{activity.time}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;