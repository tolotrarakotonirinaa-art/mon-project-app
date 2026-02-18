import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AuthPage from './components/auth/AuthPage';
import Layout from './components/layout/Layout';

// Import de toutes les pages
import Dashboard from './components/dashboard/Dashboard';
import ProjectsPage from './components/projects/ProjectsPage';
import TasksPage from './components/tasks/TasksPage';
import PipelinePage from './components/pipeline/PipelinePage';
import RepositoriesPage from './components/repositories/RepositoriesPage';
import EnvironmentsPage from './components/environments/EnvironmentsPage';
import DevSpacePage from './components/devspace/DevSpacePage';
import DocumentationPage from './components/documentation/DocumentationPage';
import CommunicationPage from './components/communication/CommunicationPage';
import StatisticsPage from './components/statistics/StatisticsPage';
import UsersPage from './components/users/UsersPage';
import SettingsPage from './components/settings/SettingsPage';
import HelpPage from './components/help/HelpPage';
import LogoutPage from './components/logout/LogoutPage';

const AppContent = () => {
    const { isAuthenticated } = useAuth();
    const [showAuth, setShowAuth] = useState(!isAuthenticated);
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleLoginSuccess = () => {
        setShowAuth(false);
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    if (showAuth) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }

    const renderPage = () => {
        switch(currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'projects':
                return <ProjectsPage />;
            case 'tasks':
                return <TasksPage />;
            case 'pipeline':
                return <PipelinePage />;
            case 'repositories':
                return <RepositoriesPage />;
            case 'environments':
                return <EnvironmentsPage />;
            case 'dev-space':
                return <DevSpacePage />;
            case 'documentation':
                return <DocumentationPage />;
            case 'communication':
                return <CommunicationPage />;
            case 'statistics':
                return <StatisticsPage />;
            case 'users':
                return <UsersPage />;
            case 'settings':
                return <SettingsPage />;
            case 'help':
                return <HelpPage />;
            case 'logout':
                return <LogoutPage onNavigate={handleNavigate} />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <Layout currentPage={currentPage} onNavigate={handleNavigate}>
            {renderPage()}
        </Layout>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </AuthProvider>
    );
};

export default App;