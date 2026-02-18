import React, { createContext, useState, useContext } from 'react';
import { DEFAULT_DATA } from '../services/mockData';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [projects, setProjects] = useState(DEFAULT_DATA.projects);
    const [tasks, setTasks] = useState(DEFAULT_DATA.tasks);
    const [users, setUsers] = useState(DEFAULT_DATA.users);
    const [repositories, setRepositories] = useState(DEFAULT_DATA.repositories);
    const [environments, setEnvironments] = useState(DEFAULT_DATA.environments);
    const [activities, setActivities] = useState(DEFAULT_DATA.activities);
    const [chatMessages, setChatMessages] = useState(DEFAULT_DATA.chatMessages);
    const [pipelineLogs, setPipelineLogs] = useState(DEFAULT_DATA.pipelineLogs);
    const [pipelineStatus, setPipelineStatus] = useState(DEFAULT_DATA.pipelineStatus);

    const addActivity = (user, action) => {
        const newActivity = {
            id: activities.length + 1,
            user: user,
            action: action,
            icon: "user",
            time: "À l'instant"
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    };

    const addProject = (project) => {
        setProjects(prev => [...prev, project]);
    };

    const updateProject = (id, updates) => {
        setProjects(prev => prev.map(project => 
            project.id === id ? { ...project, ...updates } : project
        ));
    };

    const addTask = (task) => {
        setTasks(prev => [...prev, task]);
    };

    const updateTask = (id, updates) => {
        setTasks(prev => prev.map(task => 
            task.id === id ? { ...task, ...updates } : task
        ));
    };

    const moveTask = (taskId, newStatus) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    const addUser = (user) => {
        setUsers(prev => [...prev, user]);
    };

    const updateUser = (id, updates) => {
        setUsers(prev => prev.map(user => 
            user.id === id ? { ...user, ...updates } : user
        ));
    };

    const deleteUser = (id) => {
        setUsers(prev => prev.filter(user => user.id !== id));
    };

    const addChatMessage = (message) => {
        setChatMessages(prev => [...prev, message]);
    };

    const clearChatMessages = () => {
        setChatMessages([]);
    };

    const updatePipelineStatus = (updates) => {
        setPipelineStatus(prev => ({ ...prev, ...updates }));
    };

    const addPipelineLog = (log) => {
        setPipelineLogs(prev => [...prev, log]);
    };

    const clearPipelineLogs = () => {
        setPipelineLogs([]);
    };

    const value = {
        projects,
        tasks,
        users,
        repositories,
        environments,
        activities,
        chatMessages,
        pipelineLogs,
        pipelineStatus,
        addActivity,
        addProject,
        updateProject,
        addTask,
        updateTask,
        moveTask,
        addUser,
        updateUser,
        deleteUser,
        addChatMessage,
        clearChatMessages,
        updatePipelineStatus,
        addPipelineLog,
        clearPipelineLogs
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};