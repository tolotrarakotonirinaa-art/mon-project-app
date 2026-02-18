import React from 'react';
import { useAuth } from '../../context/AuthContext';

const EnvironmentCard = ({ env, onToggle, onDeploy, onLogs }) => {
    const { hasPermission } = useAuth();

    return (
        <div className={`env-card ${env.type}`}>
            <div className="env-header">
                <h3 className="env-name">
                    <i className="fas fa-server"></i>
                    {env.name}
                </h3>
                <div className={`env-status status-${env.status}`}>
                    {env.status === 'running' ? 'En cours' : 'Arrêté'}
                </div>
            </div>
            <div className="env-details">
                <div className="env-detail">
                    <span className="env-detail-label">URL:</span>
                    <span className="env-detail-value">
                        <a href={env.url} target="_blank" rel="noopener noreferrer">{env.url}</a>
                    </span>
                </div>
                <div className="env-detail">
                    <span className="env-detail-label">Version:</span>
                    <span className="env-detail-value">{env.version}</span>
                </div>
                <div className="env-detail">
                    <span className="env-detail-label">Dernier déploiement:</span>
                    <span className="env-detail-value">{env.lastDeploy}</span>
                </div>
            </div>
            <div className="mt-20">
                {hasPermission('admin') && (
                    <button 
                        className={`btn btn-sm ${env.status === 'running' ? 'btn-warning' : 'btn-success'}`} 
                        onClick={() => onToggle(env)}
                    >
                        <i className="fas fa-power-off"></i>
                        {env.status === 'running' ? 'Arrêter' : 'Démarrer'}
                    </button>
                )}
                {hasPermission('dev') && (
                    <>
                        <button className="btn btn-sm btn-info" onClick={() => onDeploy(env)}>
                            <i className="fas fa-rocket"></i> Déployer
                        </button>
                        <button className="btn btn-sm" onClick={() => onLogs(env)}>
                            <i className="fas fa-file-alt"></i> Logs
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EnvironmentCard;