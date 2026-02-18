import React from 'react';

const UserRow = ({ user, currentUserId, onEdit, onDelete }) => {
    const getRoleClass = (role) => {
        switch(role) {
            case 'admin': return 'role-admin';
            case 'dev': return 'role-dev';
            case 'client': return 'role-client';
            default: return '';
        }
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
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
                <span className={`user-role ${getRoleClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                </span>
            </td>
            <td>{user.joinDate}</td>
            <td>
                <div className="user-actions">
                    <button className="btn btn-sm btn-info" onClick={() => onEdit(user)}>
                        <i className="fas fa-edit"></i>
                    </button>
                    <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => onDelete(user)}
                        disabled={user.id === currentUserId}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default UserRow;