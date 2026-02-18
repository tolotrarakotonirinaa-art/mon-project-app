import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('admin@devenviron.com');
    const [password, setPassword] = useState('password123');
    const [userType, setUserType] = useState('dev');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simuler une vérification des identifiants
        // En production, ce serait une requête API
        const mockUser = {
            id: 1,
            name: userType === 'admin' ? 'Admin User' : 
                  userType === 'dev' ? 'John Doe' : 'Sophie Lambert',
            email: email,
            role: userType
        };
        
        login(mockUser);
        onLoginSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                    type="email"
                    id="login-email"
                    className="form-control"
                    placeholder="email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                    type="password"
                    id="login-password"
                    className="form-control"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            
            <div className="form-group">
                <label>Type d'utilisateur</label>
                <div className="user-type-selector">
                    {['admin', 'dev', 'client'].map(type => (
                        <div
                            key={type}
                            className={`user-type-option ${userType === type ? 'selected' : ''}`}
                            onClick={() => setUserType(type)}
                        >
                            <i className={`fas fa-${type === 'admin' ? 'user-shield' : type === 'dev' ? 'code' : 'user-tie'}`}></i>
                            <span>{type === 'admin' ? 'Administrateur' : type === 'dev' ? 'Développeur' : 'Client'}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <button type="submit" className="btn btn-block">
                Se connecter
            </button>
            
            <div className="auth-footer">
                <p>Utilisez "admin@devenviron.com" / "password123" pour tester</p>
            </div>
        </form>
    );
};

export default LoginForm;