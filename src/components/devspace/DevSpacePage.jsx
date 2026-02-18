import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import DevToolCard from './DevToolCard';
import Terminal from './Terminal';
import CodeEditor from './CodeEditor';

const DevSpacePage = () => {
    const { hasPermission } = useAuth();
    const [showTerminal, setShowTerminal] = useState(false);
    const [showEditor, setShowEditor] = useState(false);

    const handleLaunchTerminal = () => {
        setShowTerminal(true);
        setShowEditor(false);
    };

    const handleOpenEditor = () => {
        setShowEditor(true);
        setShowTerminal(false);
    };

    const handleCloseTerminal = () => {
        setShowTerminal(false);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
    };

    const handleRunTests = () => {
        alert('Exécution des tests...');
    };

    const handleAnalyzePerformance = () => {
        alert('Analyse des performances...');
    };

    const tools = [
        {
            id: 'terminal',
            icon: 'terminal',
            title: 'Terminal',
            description: 'Accédez à un terminal intégré pour exécuter des commandes directement depuis votre navigateur.',
            buttonLabel: 'Lancer',
            buttonClass: 'btn-success',
            onClick: handleLaunchTerminal
        },
        {
            id: 'editor',
            icon: 'code',
            title: 'Éditeur de code',
            description: 'Éditez vos fichiers de code directement dans la plateforme avec la coloration syntaxique.',
            buttonLabel: 'Ouvrir',
            buttonClass: 'btn-info',
            onClick: handleOpenEditor
        },
        {
            id: 'debugger',
            icon: 'bug',
            title: 'Débogueur',
            description: 'Déboguez vos applications avec les outils de développement intégrés.',
            buttonLabel: 'Démarrer',
            buttonClass: 'btn-warning',
            onClick: () => alert('Débogueur démarré!')
        },
        {
            id: 'database',
            icon: 'database',
            title: 'Base de données',
            description: 'Gérez vos bases de données et exécutez des requêtes SQL directement.',
            buttonLabel: 'Ouvrir',
            buttonClass: 'btn-info',
            onClick: () => alert('Gestionnaire de base de données')
        },
        {
            id: 'tests',
            icon: 'vial',
            title: 'Tests unitaires',
            description: 'Exécutez vos tests unitaires et visualisez les résultats en temps réel.',
            buttonLabel: 'Exécuter',
            buttonClass: 'btn-success',
            onClick: handleRunTests
        },
        {
            id: 'performance',
            icon: 'chart-bar',
            title: 'Analyse de performances',
            description: 'Analysez les performances de votre code avec des outils de profilage.',
            buttonLabel: 'Analyser',
            buttonClass: 'btn-info',
            onClick: handleAnalyzePerformance
        }
    ];

    if (!hasPermission('dev')) {
        return (
            <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle"></i>
                Accès restreint. Cette page est réservée aux développeurs et administrateurs.
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="Espace Développeur"
                icon="laptop-code"
                actions={[
                    {
                        label: 'Nouveau terminal',
                        icon: 'terminal',
                        onClick: handleLaunchTerminal,
                        className: 'btn-success'
                    },
                    {
                        label: 'Actualiser',
                        icon: 'sync-alt',
                        onClick: () => alert('Espace développeur actualisé!'),
                        className: 'btn-info'
                    }
                ]}
            />
            
            <div className="dev-tools-grid">
                {tools.map(tool => (
                    <DevToolCard key={tool.id} tool={tool} />
                ))}
            </div>
            
            {showTerminal && <Terminal onClose={handleCloseTerminal} />}
            {showEditor && <CodeEditor onClose={handleCloseEditor} />}
        </>
    );
};

export default DevSpacePage;