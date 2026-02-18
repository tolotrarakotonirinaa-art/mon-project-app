import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ currentPage, onNavigate }) => {
    const { hasPermission } = useAuth();

    const menuItems = [
        {
            section: 'Général',
            items: [
                { page: 'dashboard', icon: 'tachometer-alt', label: 'Tableau de bord', roles: 'any' }
            ]
        },
        {
            items: [
                { page: 'projects', icon: 'project-diagram', label: 'Projets', roles: 'any' },
                { page: 'tasks', icon: 'tasks', label: 'Tâches', roles: 'any' }
            ]
        },
        {
            section: 'Développement',
            items: [
                { page: 'pipeline', icon: 'stream', label: 'Pipeline CI/CD', roles: 'dev' },
                { page: 'repositories', icon: 'git-alt', label: 'Dépôts Git', roles: 'dev' },
                { page: 'environments', icon: 'server', label: 'Environnements', roles: 'dev' },
                { page: 'dev-space', icon: 'laptop-code', label: 'Espace Développeur', roles: 'dev' }
            ]
        },
        {
            section: 'Collaboration',
            items: [
                { page: 'documentation', icon: 'book', label: 'Documentation', roles: 'any' },
                { page: 'communication', icon: 'comments', label: 'Communication', roles: 'any' },
                { page: 'statistics', icon: 'chart-bar', label: 'Statistiques', roles: 'dev' }
            ]
        },
        {
            section: 'Administration',
            items: [
                { page: 'users', icon: 'users', label: 'Utilisateurs', roles: 'admin' }
            ]
        },
        {
            items: [
                { page: 'settings', icon: 'cog', label: 'Paramètres', roles: 'any' }
            ]
        },
        {
            divider: true
        },
        {
            items: [
                { page: 'help', icon: 'question-circle', label: 'Aide & Support', roles: 'any' },
                { page: 'logout', icon: 'sign-out-alt', label: 'Déconnexion', roles: 'any' }
            ]
        }
    ];

    const isVisible = (item) => {
        if (item.roles === 'any') return true;
        return hasPermission(item.roles);
    };

    return (
        <nav className="sidebar">
            <ul className="sidebar-menu">
                {menuItems.map((section, sectionIndex) => {
                    if (section.divider) {
                        return <li key={`divider-${sectionIndex}`} className="menu-divider"></li>;
                    }

                    return (
                        <React.Fragment key={sectionIndex}>
                            {section.section && (
                                <li className="menu-title">{section.section}</li>
                            )}
                            {section.items.map((item, itemIndex) => (
                                isVisible(item) && (
                                    <li key={`${sectionIndex}-${itemIndex}`} className="menu-item">
                                        <a
                                            href="#"
                                            className={currentPage === item.page ? 'active' : ''}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onNavigate(item.page);
                                            }}
                                        >
                                            <i className={`fas fa-${item.icon}`}></i>
                                            <span>{item.label}</span>
                                        </a>
                                    </li>
                                )
                            ))}
                        </React.Fragment>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Sidebar;