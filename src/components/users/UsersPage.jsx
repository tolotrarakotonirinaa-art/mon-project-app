import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import UserRow from './UserRow';
import Modal from '../common/Modal';

const UsersPage = () => {
    const { users, addUser, deleteUser, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    if (!hasPermission('admin')) {
        return (
            <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle"></i>
                Accès restreint. Cette page est réservée aux administrateurs.
            </div>
        );
    }

    const handleAddUser = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleDeleteUser = (user) => {
        if (user.id === currentUser.id) {
            alert('Vous ne pouvez pas supprimer votre propre compte');
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name}?`)) {
            deleteUser(user.id);
            addActivity(currentUser.name, `a supprimé l'utilisateur ${user.name}`);
            alert(`Utilisateur "${user.name}" supprimé`);
        }
    };

    const handleSaveUser = () => {
        const userData = {
            name: document.getElementById('user-name')?.value,
            email: document.getElementById('user-email')?.value,
            role: document.getElementById('user-role')?.value,
            password: document.getElementById('user-password')?.value || 'password123',
            joinDate: new Date().toISOString().split('T')[0]
        };

        if (editingUser) {
            // Mettre à jour l'utilisateur
            const updatedUser = { ...editingUser, ...userData };
            // Logique de mise à jour
            addActivity(currentUser.name, `a modifié l'utilisateur ${updatedUser.name}`);
        } else {
            // Créer un nouvel utilisateur
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            const newUser = { id: newId, ...userData };
            addUser(newUser);
            addActivity(currentUser.name, `a ajouté l'utilisateur ${newUser.name}`);
        }

        setShowModal(false);
        alert(editingUser ? 'Utilisateur modifié avec succès!' : 'Utilisateur créé avec succès!');
    };

    return (
        <>
            <PageHeader
                title="Gestion des utilisateurs"
                icon="users"
                actions={[
                    {
                        label: 'Ajouter un utilisateur',
                        icon: 'plus',
                        onClick: handleAddUser,
                        className: 'btn-success'
                    },
                    {
                        label: 'Exporter',
                        icon: 'file-export',
                        onClick: () => alert('Exportation des utilisateurs'),
                        className: 'btn-info'
                    },
                    {
                        label: 'Importer',
                        icon: 'file-import',
                        onClick: () => alert('Importation des utilisateurs'),
                        className: 'btn-warning'
                    }
                ]}
            />
            
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Date d'inscription</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        {users.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                currentUserId={currentUser?.id}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteUser}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? `Modifier l'utilisateur: ${editingUser.name}` : 'Ajouter un nouvel utilisateur'}
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowModal(false)
                    },
                    {
                        text: editingUser ? 'Enregistrer' : 'Créer',
                        class: 'btn-success',
                        onClick: handleSaveUser
                    }
                ]}
            >
                <div className="form-group">
                    <label>Nom complet</label>
                    <input 
                        type="text" 
                        id="user-name" 
                        className="form-control"
                        defaultValue={editingUser?.name || ''}
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        id="user-email" 
                        className="form-control"
                        defaultValue={editingUser?.email || ''}
                    />
                </div>
                {!editingUser && (
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            id="user-password" 
                            className="form-control"
                            defaultValue="password123"
                        />
                    </div>
                )}
                <div className="form-group">
                    <label>Rôle</label>
                    <select id="user-role" className="form-control" defaultValue={editingUser?.role || 'dev'}>
                        <option value="dev">Développeur</option>
                        <option value="admin">Administrateur</option>
                        <option value="client">Client</option>
                    </select>
                </div>
            </Modal>
        </>
    );
};

export default UsersPage;