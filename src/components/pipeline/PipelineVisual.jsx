import React from 'react';

const PipelineVisual = ({ status }) => {
    const stages = [
        { id: 'development', name: 'Développement', icon: 'code', status: status.development },
        { id: 'tests', name: 'Tests', icon: 'check-double', status: status.tests },
        { id: 'build', name: 'Build', icon: 'box', status: status.build },
        { id: 'deployment', name: 'Déploiement', icon: 'rocket', status: status.deployment }
    ];

    const getStatusLabel = (status) => {
        switch(status) {
            case 'completed': return 'Terminé';
            case 'active': return 'En cours';
            default: return 'En attente';
        }
    };

    return (
        <div className="pipeline-visual">
            {stages.map(stage => (
                <div key={stage.id} className="pipeline-stage">
                    <div className={`stage-icon ${stage.status}`}>
                        <i className={`fas fa-${stage.icon}`}></i>
                    </div>
                    <div className="stage-name">{stage.name}</div>
                    <div className="stage-status">{getStatusLabel(stage.status)}</div>
                </div>
            ))}
        </div>
    );
};

export default PipelineVisual;