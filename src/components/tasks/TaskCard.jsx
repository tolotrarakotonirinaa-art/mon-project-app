import React from 'react';
import { useAuth } from '../../context/AuthContext';

const TaskCard = ({ task, onEdit, onDragStart }) => {
    const { hasPermission } = useAuth();

    const getPriorityClass = (priority) => {
        switch(priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return '';
        }
    };

    const getPriorityLabel = (priority) => {
        switch(priority) {
            case 'high': return 'Haute';
            case 'medium': return 'Moyenne';
            case 'low': return 'Basse';
            default: return priority;
        }
    };

    return (
        <div 
            className="task-card"
            draggable={!hasPermission('client')}
            onDragStart={(e) => onDragStart(e, task)}
            data-task-id={task.id}
        >
            <h4>{task.title}</h4>
            <p>Projet: {task.project}</p>
            <div className="task-meta">
                <span>Échéance: {task.dueDate}</span>
                <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                </span>
            </div>
            <div className="task-meta mt-20">
                <span>Assigné à: {task.assignee}</span>
                {hasPermission('dev') && (
                    <button className="btn btn-sm btn-info" onClick={() => onEdit(task)}>
                        <i className="fas fa-edit"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskCard;