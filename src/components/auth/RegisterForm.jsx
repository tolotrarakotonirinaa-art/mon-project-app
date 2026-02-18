import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('dev');
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const { users, addUser } = useData();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        // Vérifier si l'utilisateur existe déjà
        if (users.find(u => u.email === email)) {
            setError('Un utilisateur avec cet email existe déjà');
            return;
        }

        // Créer un nouvel utilisateur
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: newId,
            name: name,
            email: email,
            role: userType,
            password: password,
            joinDate: new Date().toISOString().split('T')[0]
        };

        addUser(newUser);
        login(newUser);
        onRegisterSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-group">
                <label htmlFor="register-name">Nom complet</label>
                <input
                    type="text"
                    id="register-name"
                    className="form-control"
                    placeholder="Votre nom complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                    type="email"
                    id="register-email"
                    className="form-control"
                    placeholder="email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="register-password">Mot de passe</label>
                <input
                    type="password"
                    id="register-password"
                    className="form-control"
                    placeholder="Créez un mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
                <input
                    type="password"
                    id="register-confirm-password"
                    className="form-control"
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
            
            <button type="submit" className="btn btn-success btn-block">
                S'inscrire
            </button>
            
            <div className="auth-footer">
                <p>Déjà un compte? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Se connecter</a></p>
            </div>
        </form>
    );
};

export default RegisterForm;