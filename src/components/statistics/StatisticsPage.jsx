import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';

const StatisticsPage = () => {
    const { tasks, projects, activities } = useData();
    const { hasPermission } = useAuth();

    // Statistiques des tâches
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inprogressCount = tasks.filter(t => t.status === 'inprogress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    // Statistiques des activités par utilisateur
    const userActivities = {};
    activities.forEach(activity => {
        userActivities[activity.user] = (userActivities[activity.user] || 0) + 1;
    });

    // Données des déploiements (simulées)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    const deployments = [5, 8, 12, 7, 15, 10];

    const maxTaskValue = Math.max(todoCount, inprogressCount, doneCount, 1);
    const maxActivityValue = Math.max(...Object.values(userActivities), 1);
    const maxDeploymentValue = Math.max(...deployments);

    const handleRefreshStats = () => {
        alert('Statistiques actualisées!');
    };

    const handleExportStats = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée');
            return;
        }
        alert('Exportation des statistiques');
    };

    const BarChart = ({ data, colors, maxValue }) => {
        return (
            <div className="chart-bar">
                {data.map((item, index) => {
                    const height = (item.value / maxValue) * 150;
                    return (
                        <div
                            key={index}
                            className="chart-bar-item"
                            style={{
                                height: `${height}px`,
                                backgroundColor: colors[index % colors.length]
                            }}
                        >
                            <div className="chart-bar-value">{item.value}</div>
                            <div className="chart-bar-label">{item.label}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <PageHeader
                title="Statistiques"
                icon="chart-bar"
                actions={[
                    {
                        label: 'Actualiser',
                        icon: 'sync-alt',
                        onClick: handleRefreshStats,
                        className: 'btn-info'
                    },
                    hasPermission('admin') && {
                        label: 'Exporter',
                        icon: 'file-export',
                        onClick: handleExportStats,
                        className: 'btn-success'
                    }
                ].filter(Boolean)}
            />
            
            <div className="stats-container">
                <div className="chart-container">
                    <h3 className="chart-title">Tâches par statut</h3>
                    <div className="chart-placeholder">
                        <BarChart
                            data={[
                                { label: 'À faire', value: todoCount },
                                { label: 'En cours', value: inprogressCount },
                                { label: 'Terminé', value: doneCount }
                            ]}
                            colors={['#ff6b6b', '#ffd93d', '#6bcf7f']}
                            maxValue={maxTaskValue}
                        />
                    </div>
                </div>
                
                <div className="chart-container">
                    <h3 className="chart-title">Activité par membre</h3>
                    <div className="chart-placeholder">
                        <BarChart
                            data={Object.entries(userActivities).map(([user, count]) => ({
                                label: user.split(' ')[0],
                                value: count
                            }))}
                            colors={['#2d5f7d', '#4a9c8c', '#ff7e5f', '#17a2b8', '#28a745']}
                            maxValue={maxActivityValue}
                        />
                    </div>
                </div>
                
                <div className="chart-container">
                    <h3 className="chart-title">Progression des projets</h3>
                    <div className="chart-placeholder">
                        <BarChart
                            data={projects.map(p => ({
                                label: p.name.substring(0, 8) + '...',
                                value: p.progress
                            }))}
                            colors={['#4a9c8c', '#ff7e5f', '#17a2b8', '#6c5ce7']}
                            maxValue={100}
                        />
                    </div>
                </div>
                
                <div className="chart-container">
                    <h3 className="chart-title">Déploiements par mois</h3>
                    <div className="chart-placeholder">
                        <BarChart
                            data={months.map((month, index) => ({
                                label: month,
                                value: deployments[index]
                            }))}
                            colors={['#17a2b8', '#28a745', '#ffc107', '#dc3545']}
                            maxValue={maxDeploymentValue}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatisticsPage;