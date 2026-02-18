import React from 'react';
import { useAuth } from '../../context/AuthContext';
import TaskCard from './TaskCard';

const TaskColumn = ({ 
    title, 
    icon, 
    status, 
    tasks, 
    onAddTask, 
    onEditTask, 
    onDragStart, 
    onDrop 
}) => {
    const { hasPermission } = useAuth();

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        onDrop(e, status);
    };

    return (
        <div className="tasks-column">
            <div className="column-header">
                <h3 className="column-title">
                    <i className={`fas fa-${icon}`}></i>
                    {title}
                    <span className="task-count">{tasks.length}</span>
                </h3>
                {hasPermission('dev') && (
                    <button className="btn btn-sm btn-success" onClick={() => onAddTask(status)}>
                        <i className="fas fa-plus"></i>
                    </button>
                )}
            </div>
            <div 
                className="tasks-list" 
                data-status={status}
                onDragOver={hasPermission('client') ? null : handleDragOver}
                onDrop={hasPermission('client') ? null : handleDrop}
            >
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={onEditTask}
                        onDragStart={onDragStart}
                    />
                ))}
                {tasks.length === 0 && (
                    <p className="text-muted text-center">Aucune tâche</p>
                )}
            </div>
        </div>
    );
};

export default TaskColumn;