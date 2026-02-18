import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import EnvironmentCard from './EnvironmentCard';
import Modal from '../common/Modal';

const EnvironmentsPage = () => {
    const { environments, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleCreateEnv = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée');
            return;
        }
        setShowModal(true);
    };

    const handleRefreshEnvs = () => {
        alert('Environnements actualisés!');
    };

    const handleSaveEnv = () => {
        const newEnv = {
            id: environments.length + 1,
            name: document.getElementById('env-name')?.value || `Environnement ${environments.length + 1}`,
            type: document.getElementById('env-type')?.value || 'dev',
            status: "pending",
            url: document.getElementById('env-url')?.value || `https://${document.getElementById('env-type')?.value || 'dev'}${environments.length + 1}.example.com`,
            version: document.getElementById('env-version')?.value || "1.0.0",
            lastDeploy: new Date().toISOString().split('T')[0]
        };
        
        // Ajouter l'environnement
        addActivity(currentUser.name, `a créé l'environnement ${newEnv.name}`);
        setShowModal(false);
        alert('Environnement créé avec succès!');
    };

    const handleToggleEnvironment = (env) => {
        const action = env.status === 'running' ? 'arrêté' : 'démarré';
        addActivity(currentUser.name, `a ${action} l'environnement ${env.name}`);
        alert(`Environnement "${env.name}" ${action}`);
    };

    const handleDeployToEnvironment = (env) => {
        addActivity(currentUser.name, `a déployé sur ${env.name}`);
        alert(`Déploiement vers "${env.name}" terminé avec succès!`);
    };

    const handleViewEnvironmentLogs = (env) => {
        alert(`Affichage des logs pour ${env.name}`);
    };

    return (
        <>
            <PageHeader
                title="Environnements"
                icon="server"
                actions={[
                    hasPermission('admin') && {
                        label: 'Nouvel environnement',
                        icon: 'plus',
                        onClick: handleCreateEnv,
                        className: 'btn-success'
                    },
                    hasPermission('dev') && {
                        label: 'Actualiser',
                        icon: 'sync-alt',
                        onClick: handleRefreshEnvs,
                        className: 'btn-info'
                    }
                ].filter(Boolean)}
            />
            
            <div className="environments-grid">
                {environments.map(env => (
                    <EnvironmentCard 
                        key={env.id} 
                        env={env}
                        onToggle={handleToggleEnvironment}
                        onDeploy={handleDeployToEnvironment}
                        onLogs={handleViewEnvironmentLogs}
                    />
                ))}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Créer un nouvel environnement"
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowModal(false)
                    },
                    {
                        text: 'Créer',
                        class: 'btn-success',
                        onClick: handleSaveEnv
                    }
                ]}
            >
                <div className="form-group">
                    <label>Nom de l'environnement</label>
                    <input type="text" id="env-name" className="form-control" placeholder="ex: Développement, Staging, Production" />
                </div>
                <div className="form-group">
                    <label>Type d'environnement</label>
                    <select id="env-type" className="form-control">
                        <option value="dev">Développement</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>URL</label>
                    <input type="text" id="env-url" className="form-control" placeholder="https://exemple.com" />
                </div>
                <div className="form-group">
                    <label>Version initiale</label>
                    <input type="text" id="env-version" className="form-control" placeholder="1.0.0" />
                </div>
            </Modal>
        </>
    );
};

export default EnvironmentsPage;