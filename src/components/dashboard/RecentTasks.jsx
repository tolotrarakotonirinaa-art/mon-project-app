import React from 'react';

const RecentTasks = ({ tasks }) => {
    const getStatusLabel = (status) => {
        switch(status) {
            case 'todo': return 'À faire';
            case 'inprogress': return 'En cours';
            case 'done': return 'Terminé';
            default: return status;
        }
    };

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">Tâches à faire</h3>
                <a href="#" data-page="tasks" className="btn btn-sm">Voir tout</a>
            </div>
            <div className="card-content">
                {tasks.length === 0 ? (
                    <p className="text-muted">Aucune tâche récente</p>
                ) : (
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li key={task.id} className="task-item">
                                <div className="task-info">
                                    <h4>{task.title}</h4>
                                    <p>Projet: {task.project}</p>
                                </div>
                                <div className={`task-status status-${task.status}`}>
                                    {getStatusLabel(task.status)}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RecentTasks;