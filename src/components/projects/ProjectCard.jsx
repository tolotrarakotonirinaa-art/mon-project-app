import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({ project, onEdit }) => {
    const { hasPermission } = useAuth();

    return (
        <div className="project-card">
            <div className="project-header">
                <h3 className="project-title">{project.name}</h3>
                <div className={`project-status status-${project.status}`}>
                    {project.status === 'active' ? 'Actif' : 'En attente'}
                </div>
            </div>
            <div className="project-body">
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                    <span>Début: {project.startDate}</span>
                    <span>Fin: {project.endDate}</span>
                </div>
                <div className="project-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <div className="progress-text">
                        <span>Progression</span>
                        <span>{project.progress}%</span>
                    </div>
                </div>
                <div className="project-footer">
                    <div className="project-team">
                        {project.team.map((member, index) => (
                            <div key={index} className="team-avatar" title={member}>
                                {member}
                            </div>
                        ))}
                    </div>
                    {hasPermission('dev') && (
                        <button className="btn btn-sm btn-info" onClick={() => onEdit(project)}>
                            <i className="fas fa-edit"></i> Modifier
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;