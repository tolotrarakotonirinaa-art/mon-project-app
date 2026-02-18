import React from 'react';

const RecentProjects = ({ projects }) => {
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">Projets récents</h3>
                <a href="#" data-page="projects" className="btn btn-sm">Voir tout</a>
            </div>
            <div className="card-content">
                {projects.length === 0 ? (
                    <p className="text-muted">Aucun projet récent</p>
                ) : (
                    <ul className="project-list">
                        {projects.map(project => (
                            <li key={project.id} className="project-item">
                                <div className="project-info">
                                    <h4>{project.name}</h4>
                                    <p>{project.description.substring(0, 50)}...</p>
                                </div>
                                <div className={`project-status status-${project.status}`}>
                                    {project.status === 'active' ? 'Actif' : 'En attente'}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RecentProjects;