import React from 'react';

const ChatUser = ({ user, isActive, onClick }) => {
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
        <div className={`chat-user ${isActive ? 'active' : ''}`} onClick={onClick}>
            <div className="chat-user-avatar">{getInitials(user.name)}</div>
            <div className="chat-user-info">
                <h4>{user.name}</h4>
                <p>{getRoleLabel(user.role)}</p>
            </div>
        </div>
    );
};

export default ChatUser;