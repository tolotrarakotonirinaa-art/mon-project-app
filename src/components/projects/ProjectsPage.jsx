import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import ProjectCard from './ProjectCard';
import Modal from '../common/Modal';

const ProjectsPage = () => {
    const { projects, addProject, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const handleCreateProject = () => {
        setEditingProject(null);
        setShowModal(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setShowModal(true);
    };

    const handleSaveProject = (projectData) => {
        if (editingProject) {
            // Mettre à jour le projet
            const updatedProject = { ...editingProject, ...projectData };
            // Logique de mise à jour
        } else {
            // Créer un nouveau projet
            const newProject = {
                id: projects.length + 1,
                ...projectData,
                progress: 0,
                team: [currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()]
            };
            addProject(newProject);
            addActivity(currentUser.name, 'a créé un nouveau projet');
        }
        setShowModal(false);
    };

    return (
        <>
            <PageHeader
                title="Projets"
                icon="project-diagram"
                actions={[
                    hasPermission('dev') && {
                        label: 'Filtrer',
                        icon: 'filter',
                        onClick: () => alert('Filtre des projets'),
                        className: 'btn-info'
                    },
                    hasPermission('dev') && {
                        label: 'Nouveau projet',
                        icon: 'plus',
                        onClick: handleCreateProject,
                        className: 'btn-success'
                    },
                    hasPermission('admin') && {
                        label: 'Importer',
                        icon: 'file-import',
                        onClick: () => alert('Importation de projets'),
                        className: 'btn-warning'
                    }
                ].filter(Boolean)}
            />
            
            <div className="projects-grid">
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        project={project}
                        onEdit={handleEditProject}
                    />
                ))}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProject ? 'Modifier le projet' : 'Créer un nouveau projet'}
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowModal(false)
                    },
                    {
                        text: editingProject ? 'Enregistrer' : 'Créer',
                        class: 'btn-success',
                        onClick: () => {
                            // Récupérer les données du formulaire
                            handleSaveProject({
                                name: document.getElementById('project-name')?.value || `Projet ${projects.length + 1}`,
                                description: document.getElementById('project-description')?.value || 'Description du projet',
                                startDate: document.getElementById('project-start-date')?.value || new Date().toISOString().split('T')[0],
                                endDate: document.getElementById('project-end-date')?.value || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
                            });
                        }
                    }
                ]}
            >
                <div className="form-group">
                    <label>Nom du projet</label>
                    <input 
                        type="text" 
                        id="project-name" 
                        className="form-control" 
                        defaultValue={editingProject?.name || ''}
                        placeholder="Nom du projet"
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        id="project-description" 
                        className="form-control" 
                        rows="3"
                        defaultValue={editingProject?.description || ''}
                        placeholder="Description du projet"
                    />
                </div>
                <div className="form-group">
                    <label>Date de début</label>
                    <input 
                        type="date" 
                        id="project-start-date" 
                        className="form-control"
                        defaultValue={editingProject?.startDate || new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className="form-group">
                    <label>Date de fin estimée</label>
                    <input 
                        type="date" 
                        id="project-end-date" 
                        className="form-control"
                        defaultValue={editingProject?.endDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}
                    />
                </div>
            </Modal>
        </>
    );
};

export default ProjectsPage;