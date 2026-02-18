import React from 'react';
import { useAuth } from '../../context/AuthContext';

const LogoutPage = ({ onNavigate }) => {
    const { logout } = useAuth();

    const handleCancel = () => {
        onNavigate('dashboard');
    };

    const handleConfirm = () => {
        logout();
        window.location.reload();
    };

    return (
        <div className="logout-container">
            <div className="logout-box">
                <div className="logout-icon">
                    <i className="fas fa-sign-out-alt"></i>
                </div>
                <h2>Déconnexion</h2>
                <p>Êtes-vous sûr de vouloir vous déconnecter de la plateforme DevEnviron?</p>
                <div className="logout-actions">
                    <button className="btn" onClick={handleCancel}>
                        <i className="fas fa-times"></i> Annuler
                    </button>
                    <button className="btn btn-danger" onClick={handleConfirm}>
                        <i className="fas fa-sign-out-alt"></i> Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutPage;