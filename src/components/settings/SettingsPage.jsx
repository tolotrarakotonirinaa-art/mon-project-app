import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal';

const SettingsPage = () => {
    const { users, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Paramètres par défaut
    const [settings, setSettings] = useState({
        profile: {
            name: currentUser?.name || 'John Doe',
            email: currentUser?.email || 'john.doe@example.com',
            phone: '+33 6 12 34 56 78',
            language: 'fr',
            timezone: 'Europe/Paris'
        },
        notifications: {
            email: true,
            tasks: true,
            projects: true,
            messages: true
        },
        security: {
            twoFactor: false,
            autoLogin: false
        },
        appearance: {
            theme: 'light',
            primaryColor: '#2d5f7d'
        }
    });

    const handleSaveSettings = () => {
        addActivity(currentUser.name, 'a modifié ses paramètres');
        alert('Paramètres enregistrés avec succès!');
    };

    const handleResetSettings = () => {
        if (window.confirm('Voulez-vous vraiment réinitialiser tous les paramètres?')) {
            setSettings({
                profile: {
                    name: currentUser?.name || 'John Doe',
                    email: currentUser?.email || 'john.doe@example.com',
                    phone: '+33 6 12 34 56 78',
                    language: 'fr',
                    timezone: 'Europe/Paris'
                },
                notifications: {
                    email: true,
                    tasks: true,
                    projects: true,
                    messages: true
                },
                security: {
                    twoFactor: false,
                    autoLogin: false
                },
                appearance: {
                    theme: 'light',
                    primaryColor: '#2d5f7d'
                }
            });
            alert('Paramètres réinitialisés!');
        }
    };

    const handleProfileChange = (field, value) => {
        setSettings({
            ...settings,
            profile: { ...settings.profile, [field]: value }
        });
    };

    const handleNotificationChange = (field, checked) => {
        setSettings({
            ...settings,
            notifications: { ...settings.notifications, [field]: checked }
        });
    };

    const handleSecurityChange = (field, checked) => {
        setSettings({
            ...settings,
            security: { ...settings.security, [field]: checked }
        });
    };

    const handleAppearanceChange = (field, value) => {
        setSettings({
            ...settings,
            appearance: { ...settings.appearance, [field]: value }
        });
    };

    const handleChangePassword = () => {
        setShowPasswordModal(true);
    };

    const handleSavePassword = () => {
        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-new-password')?.value;

        if (currentPassword !== 'password123') {
            alert('Mot de passe actuel incorrect');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        setShowPasswordModal(false);
        alert('Mot de passe changé avec succès!');
    };

    return (
        <>
            <PageHeader
                title="Paramètres"
                icon="cog"
                actions={[
                    {
                        label: 'Tout enregistrer',
                        icon: 'save',
                        onClick: handleSaveSettings,
                        className: 'btn-success'
                    },
                    {
                        label: 'Réinitialiser',
                        icon: 'undo',
                        onClick: handleResetSettings,
                        className: 'btn-info'
                    }
                ]}
            />
            
            <div className="settings-container">
                <div className="settings-tabs">
                    <button 
                        className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('profile')}
                    >
                        Profil
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notifications
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('security')}
                    >
                        Sécurité
                    </button>
                    {hasPermission('dev') && (
                        <button 
                            className={`settings-tab ${activeTab === 'integrations' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('integrations')}
                        >
                            Intégrations
                        </button>
                    )}
                    <button 
                        className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('appearance')}
                    >
                        Apparence
                    </button>
                </div>
                
                {/* Profil */}
                <div id="profile-settings" className={`settings-section ${activeTab === 'profile' ? 'active' : 'hidden'}`}>
                    <div className="settings-group">
                        <h3>Informations personnelles</h3>
                        <div className="settings-item">
                            <label>Nom complet</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                style={{ width: '200px' }}
                                value={settings.profile.name}
                                onChange={(e) => handleProfileChange('name', e.target.value)}
                            />
                        </div>
                        <div className="settings-item">
                            <label>Email</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                style={{ width: '200px' }}
                                value={settings.profile.email}
                                onChange={(e) => handleProfileChange('email', e.target.value)}
                            />
                        </div>
                        <div className="settings-item">
                            <label>Téléphone</label>
                            <input 
                                type="tel" 
                                className="form-control" 
                                style={{ width: '200px' }}
                                value={settings.profile.phone}
                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="settings-group">
                        <h3>Préférences</h3>
                        <div className="settings-item">
                            <label>Langue</label>
                            <select 
                                className="form-control" 
                                style={{ width: '200px' }}
                                value={settings.profile.language}
                                onChange={(e) => handleProfileChange('language', e.target.value)}
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                        <div className="settings-item">
                            <label>Fuseau horaire</label>
                            <select 
                                className="form-control" 
                                style={{ width: '200px' }}
                                value={settings.profile.timezone}
                                onChange={(e) => handleProfileChange('timezone', e.target.value)}
                            >
                                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York (UTC-5)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button className="btn btn-success" onClick={handleSaveSettings}>
                        <i className="fas fa-save"></i> Enregistrer les modifications
                    </button>
                </div>
                
                {/* Notifications */}
                <div id="notifications-settings" className={`settings-section ${activeTab === 'notifications' ? 'active' : 'hidden'}`}>
                    <div className="settings-group">
                        <h3>Préférences de notifications</h3>
                        <div className="settings-item">
                            <label>Notifications par email</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.email}
                                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-item">
                            <label>Notifications de tâches</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.tasks}
                                    onChange={(e) => handleNotificationChange('tasks', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-item">
                            <label>Notifications de projets</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.projects}
                                    onChange={(e) => handleNotificationChange('projects', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-item">
                            <label>Notifications de messages</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.messages}
                                    onChange={(e) => handleNotificationChange('messages', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                {/* Sécurité */}
                <div id="security-settings" className={`settings-section ${activeTab === 'security' ? 'active' : 'hidden'}`}>
                    <div className="settings-group">
                        <h3>Sécurité du compte</h3>
                        <div className="settings-item">
                            <label>Authentification à deux facteurs</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.security.twoFactor}
                                    onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-item">
                            <label>Session automatique</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.security.autoLogin}
                                    onChange={(e) => handleSecurityChange('autoLogin', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <button className="btn btn-warning" onClick={handleChangePassword}>
                            <i className="fas fa-key"></i> Changer le mot de passe
                        </button>
                    </div>
                </div>
                
                {/* Intégrations */}
                {hasPermission('dev') && (
                    <div id="integrations-settings" className={`settings-section ${activeTab === 'integrations' ? 'active' : 'hidden'}`}>
                        <div className="settings-group">
                            <h3>Intégrations tierces</h3>
                            <div className="settings-item">
                                <label>GitHub</label>
                                <button className="btn btn-sm btn-info" onClick={() => alert('Connexion à GitHub')}>
                                    <i className="fab fa-github"></i> Connecter
                                </button>
                            </div>
                            <div className="settings-item">
                                <label>Slack</label>
                                <button className="btn btn-sm btn-info" onClick={() => alert('Connexion à Slack')}>
                                    <i className="fab fa-slack"></i> Connecter
                                </button>
                            </div>
                            <div className="settings-item">
                                <label>Jira</label>
                                <button className="btn btn-sm btn-info" onClick={() => alert('Connexion à Jira')}>
                                    <i className="fab fa-jira"></i> Connecter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Apparence */}
                <div id="appearance-settings" className={`settings-section ${activeTab === 'appearance' ? 'active' : 'hidden'}`}>
                    <div className="settings-group">
                        <h3>Thème et apparence</h3>
                        <div className="settings-item">
                            <label>Thème</label>
                            <select 
                                className="form-control" 
                                style={{ width: '200px' }}
                                value={settings.appearance.theme}
                                onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                            >
                                <option value="light">Clair</option>
                                <option value="dark">Sombre</option>
                                <option value="auto">Automatique</option>
                            </select>
                        </div>
                        <div className="settings-item">
                            <label>Couleur principale</label>
                            <input 
                                type="color" 
                                id="primary-color-picker" 
                                value={settings.appearance.primaryColor}
                                onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
                            />
                        </div>
                        <button className="btn btn-info" onClick={handleSaveSettings}>
                            <i className="fas fa-palette"></i> Appliquer le thème
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Changer le mot de passe"
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowPasswordModal(false)
                    },
                    {
                        text: 'Changer',
                        class: 'btn-success',
                        onClick: handleSavePassword
                    }
                ]}
            >
                <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input type="password" id="current-password" className="form-control" />
                </div>
                <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input type="password" id="new-password" className="form-control" />
                </div>
                <div className="form-group">
                    <label>Confirmer le nouveau mot de passe</label>
                    <input type="password" id="confirm-new-password" className="form-control" />
                </div>
            </Modal>
        </>
    );
};

export default SettingsPage;