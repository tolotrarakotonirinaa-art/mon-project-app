import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import DocsSection from './DocsSection';

const DocumentationPage = () => {
    const { hasPermission } = useAuth();
    const [activeDoc, setActiveDoc] = useState('getting-started');

    const docs = [
        { 
            id: 'getting-started', 
            title: 'Bien démarrer', 
            content: `
                <h3>Bien démarrer avec DevEnviron</h3>
                <p>Bienvenue sur la plateforme DevEnviron, votre environnement de développement collaboratif complet.</p>
                
                <h4>Configuration initiale</h4>
                <p>Pour commencer à utiliser la plateforme :</p>
                <ol>
                    <li>Créez un compte ou connectez-vous avec vos identifiants</li>
                    <li>Configurez votre profil utilisateur</li>
                    <li>Rejoignez ou créez un projet</li>
                    <li>Invitez des membres de votre équipe</li>
                    <li>Configurez votre environnement de développement</li>
                </ol>
            `
        },
        { 
            id: 'workflow', 
            title: 'Workflow de développement', 
            content: `
                <h3>Workflow de développement</h3>
                <p>Notre workflow suit les meilleures pratiques de développement agile.</p>
                
                <h4>Git Flow</h4>
                <p>Nous utilisons le modèle Git Flow pour la gestion des branches :</p>
                <div class="code-block">
                    main (branche principale pour la production)<br>
                    ├── develop (branche de développement)<br>
                    ├── feature/* (nouvelles fonctionnalités)<br>
                    ├── release/* (préparation des versions)<br>
                    └── hotfix/* (correctifs urgents)
                </div>
            `
        },
        { 
            id: 'api', 
            title: 'Documentation API', 
            content: `
                <h3>Documentation API</h3>
                <p>La plateforme expose une API RESTful pour l'intégration avec d'autres outils.</p>
                
                <h4>Endpoints principaux</h4>
                <div class="code-block">
                    GET    /api/projects          # Lister les projets<br>
                    POST   /api/projects          # Créer un projet<br>
                    GET    /api/projects/{id}     # Détails d'un projet<br>
                    PUT    /api/projects/{id}     # Mettre à jour un projet<br>
                    DELETE /api/projects/{id}     # Supprimer un projet<br>
                    <br>
                    GET    /api/tasks             # Lister les tâches<br>
                    POST   /api/tasks             # Créer une tâche<br>
                    GET    /api/tasks/{id}        # Détails d'une tâche<br>
                    PUT    /api/tasks/{id}        # Mettre à jour une tâche
                </div>
            `
        }
    ];

    const handleAddDoc = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée');
            return;
        }
        alert('Ajout d\'un document');
    };

    return (
        <>
            <PageHeader
                title="Documentation"
                icon="book"
                actions={[
                    hasPermission('admin') && {
                        label: 'Ajouter un document',
                        icon: 'plus',
                        onClick: handleAddDoc,
                        className: 'btn-success'
                    },
                    {
                        label: 'Rechercher',
                        icon: 'search',
                        onClick: () => alert('Recherche dans la documentation'),
                        className: 'btn-info'
                    }
                ].filter(Boolean)}
            />
            
            <div className="docs-container">
                <div className="docs-sidebar">
                    <ul className="docs-nav" id="docs-nav">
                        {docs.map(doc => (
                            <li key={doc.id} className="docs-nav-item">
                                <a 
                                    href="#" 
                                    className={activeDoc === doc.id ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveDoc(doc.id);
                                    }}
                                >
                                    {doc.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="docs-content">
                    {docs.map(doc => (
                        <DocsSection 
                            key={doc.id} 
                            id={doc.id} 
                            content={doc.content} 
                            isActive={activeDoc === doc.id}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default DocumentationPage;