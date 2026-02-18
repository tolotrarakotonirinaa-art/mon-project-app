import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import PipelineVisual from './PipelineVisual';

const PipelinePage = () => {
    const { pipelineLogs, pipelineStatus, updatePipelineStatus, addPipelineLog, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();

    const handleRunPipeline = () => {
        if (hasPermission('client')) {
            alert('Permission refusée');
            return;
        }

        updatePipelineStatus({
            development: "completed",
            tests: "active",
            build: "pending",
            deployment: "pending"
        });

        addPipelineLog(`[${new Date().toLocaleTimeString()}] Démarrage du pipeline CI/CD...`);
        addPipelineLog(`[${new Date().toLocaleTimeString()}] Récupération du code depuis Git...`);
        
        addActivity(currentUser.name, 'a démarré le pipeline CI/CD');
    };

    const handleTriggerTest = () => {
        updatePipelineStatus({ tests: "completed", build: "active" });
        addPipelineLog(`[${new Date().toLocaleTimeString()}] Tests unitaires exécutés avec succès (152 tests passés)`);
        addActivity(currentUser.name, 'a exécuté les tests');
    };

    const handleTriggerBuild = () => {
        updatePipelineStatus({ build: "completed", deployment: "active" });
        addPipelineLog(`[${new Date().toLocaleTimeString()}] Build terminé avec succès`);
        addActivity(currentUser.name, 'a complété le build');
    };

    const handleDeployStaging = () => {
        updatePipelineStatus({ deployment: "completed" });
        addPipelineLog(`[${new Date().toLocaleTimeString()}] Déploiement en staging réussi`);
        addActivity(currentUser.name, 'a déployé en staging');
    };

    const handleDeployProd = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée. Seuls les administrateurs peuvent déployer en production.');
            return;
        }
        addPipelineLog(`[${new Date().toLocaleTimeString()}] Déploiement en production réussi`);
        addActivity(currentUser.name, 'a déployé en production');
    };

    const handleResetPipeline = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée');
            return;
        }
        updatePipelineStatus({ development: "completed", tests: "active", build: "pending", deployment: "pending" });
        addActivity(currentUser.name, 'a réinitialisé le pipeline');
    };

    const handleClearLogs = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée');
            return;
        }
        // Logique pour effacer les logs
        alert('Logs effacés!');
    };

    return (
        <>
            <PageHeader
                title="Pipeline CI/CD"
                icon="stream"
                actions={[
                    hasPermission('dev') && {
                        label: 'Exécuter le pipeline',
                        icon: 'play',
                        onClick: handleRunPipeline,
                        className: 'btn-info'
                    },
                    hasPermission('admin') && {
                        label: 'Réinitialiser',
                        icon: 'redo',
                        onClick: handleResetPipeline,
                        className: 'btn-warning'
                    }
                ].filter(Boolean)}
            />
            
            <div className="pipeline-container">
                <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i>
                    Le pipeline CI/CD automatise le processus de développement, de test et de déploiement.
                </div>
                
                <PipelineVisual status={pipelineStatus} />
                
                <div className="pipeline-actions">
                    <button 
                        className="btn btn-success dev-only admin-only" 
                        onClick={handleTriggerTest}
                        disabled={pipelineStatus.tests !== 'active'}
                    >
                        <i className="fas fa-vial"></i> Lancer les tests
                    </button>
                    <button 
                        className="btn btn-warning dev-only admin-only" 
                        onClick={handleTriggerBuild}
                        disabled={pipelineStatus.build !== 'active'}
                    >
                        <i className="fas fa-cogs"></i> Démarrer le build
                    </button>
                    <button 
                        className="btn btn-info dev-only admin-only" 
                        onClick={handleDeployStaging}
                        disabled={pipelineStatus.deployment !== 'active'}
                    >
                        <i className="fas fa-server"></i> Déployer en staging
                    </button>
                    <button 
                        className="btn btn-danger admin-only" 
                        onClick={handleDeployProd}
                    >
                        <i className="fas fa-rocket"></i> Déployer en production
                    </button>
                </div>
                
                <div className="pipeline-logs mt-20">
                    <div className="card-header">
                        <h3 className="card-title">Logs du pipeline</h3>
                        {hasPermission('admin') && (
                            <button className="btn btn-sm btn-danger" onClick={handleClearLogs}>
                                <i className="fas fa-trash"></i> Effacer les logs
                            </button>
                        )}
                    </div>
                    <div className="code-block" id="pipeline-logs">
                        {pipelineLogs.map((log, index) => (
                            <div key={index}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PipelinePage;