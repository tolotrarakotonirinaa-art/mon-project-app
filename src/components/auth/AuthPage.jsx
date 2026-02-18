import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = ({ onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState('login');

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1><i className="fas fa-code-branch"></i> DevEnviron</h1>
                    <p>Plateforme de développement environnemental en équipe</p>
                </div>
                
                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('login')}
                    >
                        Connexion
                    </button>
                    <button 
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('register')}
                    >
                        Inscription
                    </button>
                </div>
                
                {activeTab === 'login' ? (
                    <LoginForm onLoginSuccess={onLoginSuccess} />
                ) : (
                    <RegisterForm onRegisterSuccess={onLoginSuccess} onSwitchToLogin={() => setActiveTab('login')} />
                )}
            </div>
        </div>
    );
};

export default AuthPage;