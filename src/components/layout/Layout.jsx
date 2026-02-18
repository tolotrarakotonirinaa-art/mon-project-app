import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, currentPage, onNavigate }) => {
    const { currentUser } = useAuth();

    return (
        <div className="app-container">
            <Header user={currentUser} />
            <div className="app-layout">
                <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;