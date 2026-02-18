import React, { useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatsCards from './StatsCards';
import RecentProjects from './RecentProjects';
import RecentTasks from './RecentTasks';
import ActivityFeed from './ActivityFeed';
import PageHeader from '../common/PageHeader';

const Dashboard = () => {
    const { projects, tasks, users } = useData();
    const { hasPermission } = useAuth();

    const stats = {
        projects: projects.length,
        tasks: tasks.filter(t => t.status !== 'done').length,
        users: users.length,
        pipelines: 3
    };

    useEffect(() => {
        // Ajouter une activité de connexion si nécessaire
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleExport = () => {
        alert('Exportation des données...');
    };

    return (
        <>
            <PageHeader
                title="Tableau de bord"
                icon="tachometer-alt"
                actions={[
                    {
                        label: 'Actualiser',
                        icon: 'sync-alt',
                        onClick: handleRefresh,
                        className: 'btn-info'
                    },
                    hasPermission('dev') && {
                        label: 'Nouveau projet',
                        icon: 'plus',
                        onClick: () => alert('Création d\'un nouveau projet'),
                        className: 'btn-success'
                    },
                    hasPermission('admin') && {
                        label: 'Exporter',
                        icon: 'download',
                        onClick: handleExport,
                        className: 'btn-warning'
                    }
                ].filter(Boolean)}
            />
            
            <StatsCards stats={stats} />
            
            <div className="dashboard-sections">
                <RecentProjects projects={projects.slice(0, 3)} />
                <RecentTasks tasks={tasks.slice(0, 3)} />
                <ActivityFeed />
            </div>
        </>
    );
};

export default Dashboard;