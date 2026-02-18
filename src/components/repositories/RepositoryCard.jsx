import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RepositoryCard = ({ repo, onView, onClone }) => {
    const { hasPermission } = useAuth();

    return (
        <div className="repo-card">
            <div className="repo-header">
                <h3 className="repo-name">
                    <i className="fab fa-git-alt"></i>
                    {repo.name}
                </h3>
                <div className="repo-visibility">
                    {repo.visibility === 'public' ? 'Public' : 'Privé'}
                </div>
            </div>
            <p className="repo-description">{repo.description}</p>
            <div className="repo-stats">
                <div className="repo-stat">
                    <i className="fas fa-star"></i>
                    <span>{repo.stars}</span>
                </div>
                <div className="repo-stat">
                    <i className="fas fa-code-branch"></i>
                    <span>{repo.forks}</span>
                </div>
            </div>
            <div className="repo-last-update">
                <i className="fas fa-clock"></i> Dernière mise à jour: {repo.lastUpdate}
            </div>
            <div className="mt-20">
                {hasPermission('dev') && (
                    <>
                        <button className="btn btn-sm" onClick={() => onView(repo)}>
                            <i className="fas fa-code"></i> Voir le code
                        </button>
                        <button className="btn btn-sm btn-info" onClick={() => onClone(repo)}>
                            <i className="fas fa-clone"></i> Cloner
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RepositoryCard;