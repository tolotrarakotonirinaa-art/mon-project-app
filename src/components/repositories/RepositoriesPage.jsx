import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import RepositoryCard from './RepositoryCard';
import Modal from '../common/Modal';

const RepositoriesPage = () => {
    const { repositories, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleCreateRepo = () => {
        setShowModal(true);
    };

    const handleSyncRepos = () => {
        alert('Synchronisation des dépôts...');
    };

    const handleSaveRepo = () => {
        const newRepo = {
            id: repositories.length + 1,
            name: document.getElementById('repo-name')?.value || `nouveau-repo-${repositories.length + 1}`,
            description: document.getElementById('repo-description')?.value || 'Description du nouveau dépôt',
            visibility: document.getElementById('repo-visibility')?.value || 'private',
            stars: 0,
            forks: 0,
            lastUpdate: "À l'instant"
        };
        
        // Ajouter le dépôt
        addActivity(currentUser.name, 'a créé un nouveau dépôt Git');
        setShowModal(false);
        alert('Dépôt créé avec succès!');
    };

    const handleViewRepository = (repo) => {
        alert(`Affichage du dépôt: ${repo.name}`);
    };

    const handleCloneRepository = (repo) => {
        const cloneUrl = `https://github.com/example/${repo.name}.git`;
        navigator.clipboard.writeText(cloneUrl);
        addActivity(currentUser.name, `a cloné le dépôt ${repo.name}`);
        alert(`URL de clonage copiée: ${cloneUrl}`);
    };

    return (
        <>
            <PageHeader
                title="Dépôts Git"
                icon="git-alt"
                actions={[
                    hasPermission('dev') && {
                        label: 'Nouveau dépôt',
                        icon: 'plus',
                        onClick: handleCreateRepo,
                        className: 'btn-success'
                    },
                    hasPermission('dev') && {
                        label: 'Synchroniser',
                        icon: 'sync-alt',
                        onClick: handleSyncRepos,
                        className: 'btn-info'
                    }
                ].filter(Boolean)}
            />
            
            <div className="repos-grid">
                {repositories.map(repo => (
                    <RepositoryCard 
                        key={repo.id} 
                        repo={repo}
                        onView={handleViewRepository}
                        onClone={handleCloneRepository}
                    />
                ))}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Créer un nouveau dépôt Git"
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowModal(false)
                    },
                    {
                        text: 'Créer',
                        class: 'btn-success',
                        onClick: handleSaveRepo
                    }
                ]}
            >
                <div className="form-group">
                    <label>Nom du dépôt</label>
                    <input type="text" id="repo-name" className="form-control" placeholder="nom-du-depot" />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea id="repo-description" className="form-control" rows="3" placeholder="Description du dépôt" />
                </div>
                <div className="form-group">
                    <label>Visibilité</label>
                    <select id="repo-visibility" className="form-control">
                        <option value="private">Privé</option>
                        <option value="public">Public</option>
                    </select>
                </div>
            </Modal>
        </>
    );
};

export default RepositoriesPage;