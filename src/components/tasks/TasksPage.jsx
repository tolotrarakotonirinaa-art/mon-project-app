import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import TaskColumn from './TaskColumn';
import Modal from '../common/Modal';

const TasksPage = () => {
    const { tasks, projects, addTask, moveTask, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskStatus, setTaskStatus] = useState('todo');

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inprogressTasks = tasks.filter(t => t.status === 'inprogress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const handleCreateTask = (status = 'todo') => {
        setEditingTask(null);
        setTaskStatus(status);
        setShowModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskStatus(task.status);
        setShowModal(true);
    };

    const handleSaveTask = (taskData) => {
        if (editingTask) {
            // Mettre à jour la tâche
            const updatedTask = { ...editingTask, ...taskData };
            // Logique de mise à jour
        } else {
            // Créer une nouvelle tâche
            const newTask = {
                id: tasks.length + 1,
                ...taskData,
                status: taskStatus,
                assignee: currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
                createdAt: new Date().toISOString()
            };
            addTask(newTask);
            addActivity(currentUser.name, 'a créé une nouvelle tâche');
        }
        setShowModal(false);
    };

    const handleDragStart = (e, task) => {
        if (hasPermission('client')) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', task.id.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        if (hasPermission('client')) return;

        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        moveTask(taskId, status);
        addActivity(currentUser.name, `a déplacé une tâche vers "${status}"`);
    };

    return (
        <>
            <PageHeader
                title="Tâches"
                icon="tasks"
                actions={[
                    hasPermission('dev') && {
                        label: 'Filtrer',
                        icon: 'filter',
                        onClick: () => alert('Filtre des tâches'),
                        className: 'btn-info'
                    },
                    hasPermission('dev') && {
                        label: 'Nouvelle tâche',
                        icon: 'plus',
                        onClick: () => handleCreateTask('todo'),
                        className: 'btn-success'
                    },
                    hasPermission('admin') && {
                        label: 'Édition groupée',
                        icon: 'edit',
                        onClick: () => alert('Édition groupée des tâches'),
                        className: 'btn-warning'
                    }
                ].filter(Boolean)}
            />
            
            <div className="tasks-container">
                <TaskColumn
                    title="À faire"
                    icon="clipboard-list"
                    status="todo"
                    tasks={todoTasks}
                    onAddTask={() => handleCreateTask('todo')}
                    onEditTask={handleEditTask}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
                <TaskColumn
                    title="En cours"
                    icon="spinner"
                    status="inprogress"
                    tasks={inprogressTasks}
                    onAddTask={() => handleCreateTask('inprogress')}
                    onEditTask={handleEditTask}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
                <TaskColumn
                    title="Terminé"
                    icon="check-circle"
                    status="done"
                    tasks={doneTasks}
                    onAddTask={() => handleCreateTask('done')}
                    onEditTask={handleEditTask}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingTask ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowModal(false)
                    },
                    {
                        text: editingTask ? 'Enregistrer' : 'Créer',
                        class: 'btn-success',
                        onClick: () => {
                            handleSaveTask({
                                title: document.getElementById('task-title')?.value || `Tâche ${tasks.length + 1}`,
                                description: document.getElementById('task-description')?.value || '',
                                project: document.getElementById('task-project')?.value || projects[0]?.name || 'Sans projet',
                                priority: document.getElementById('task-priority')?.value || 'medium',
                                dueDate: document.getElementById('task-duedate')?.value || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
                            });
                        }
                    }
                ]}
            >
                <div className="form-group">
                    <label>Titre</label>
                    <input 
                        type="text" 
                        id="task-title" 
                        className="form-control"
                        defaultValue={editingTask?.title || ''}
                        placeholder="Titre de la tâche"
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        id="task-description" 
                        className="form-control" 
                        rows="2"
                        defaultValue={editingTask?.description || ''}
                        placeholder="Description de la tâche"
                    />
                </div>
                <div className="form-group">
                    <label>Projet</label>
                    <select id="task-project" className="form-control" defaultValue={editingTask?.project || projects[0]?.name}>
                        {projects.map(project => (
                            <option key={project.id} value={project.name}>{project.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Priorité</label>
                    <select id="task-priority" className="form-control" defaultValue={editingTask?.priority || 'medium'}>
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Date d'échéance</label>
                    <input 
                        type="date" 
                        id="task-duedate" 
                        className="form-control"
                        defaultValue={editingTask?.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}
                    />
                </div>
            </Modal>
        </>
    );
};

export default TasksPage;