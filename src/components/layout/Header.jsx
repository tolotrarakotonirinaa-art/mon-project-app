import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ user }) => {
    const { logout } = useAuth();

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'admin': return 'Administrateur';
            case 'dev': return 'Développeur';
            case 'client': return 'Client';
            default: return role;
        }
    };

    return (
        <header className="app-header">
            <div className="container header-content">
                <a href="#" className="logo">
                    <i className="fas fa-code-branch"></i>
                    <span>DevEnviron</span>
                </a>
                
                <div className="user-info">
                    <div className="user-avatar">
                        {user ? getInitials(user.name) : 'GU'}
                    </div>
                    <div className="user-name">
                        {user?.name || 'Invité'}
                    </div>
                    <div className="user-role-badge">
                        {user ? getRoleLabel(user.role) : 'Non connecté'}
                    </div>
                    <button className="btn btn-sm btn-info" onClick={() => window.location.reload()}>
                        <i className="fas fa-redo"></i> Actualiser
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;