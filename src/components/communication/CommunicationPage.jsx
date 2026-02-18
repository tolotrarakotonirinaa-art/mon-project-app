import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import ChatUser from './ChatUser';
import Message from './Message';

const CommunicationPage = () => {
    const { users, chatMessages, addChatMessage, clearChatMessages, addActivity } = useData();
    const { currentUser, hasPermission } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: chatMessages.length + 1,
            sender: "Vous",
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "sent"
        };

        addChatMessage(newMessage);
        addActivity(currentUser.name, 'a envoyé un message');
        setMessage('');

        // Réponse automatique
        setTimeout(() => {
            const autoReply = {
                id: chatMessages.length + 2,
                sender: selectedUser?.name || "Système",
                message: "Message reçu. Notre équipe vous répondra bientôt.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: "received"
            };
            addChatMessage(autoReply);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        if (!hasPermission('admin')) {
            alert('Permission refusée');
            return;
        }
        if (window.confirm('Voulez-vous vraiment effacer tout l\'historique de chat?')) {
            clearChatMessages();
        }
    };

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
        <>
            <PageHeader
                title="Communication"
                icon="comments"
                actions={[
                    hasPermission('admin') && {
                        label: 'Nouveau canal',
                        icon: 'plus',
                        onClick: () => alert('Création d\'un nouveau canal'),
                        className: 'btn-success'
                    },
                    {
                        label: 'Appel vocal',
                        icon: 'phone',
                        onClick: () => alert('Appel vocal démarré'),
                        className: 'btn-info'
                    }
                ].filter(Boolean)}
            />
            
            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="chat-users" id="chat-users">
                        {users
                            .filter(user => user.id !== currentUser?.id)
                            .map(user => (
                                <ChatUser
                                    key={user.id}
                                    user={user}
                                    isActive={selectedUser?.id === user.id}
                                    onClick={() => setSelectedUser(user)}
                                />
                            ))
                        }
                    </div>
                    {hasPermission('admin') && (
                        <div className="chat-sidebar-footer">
                            <button className="btn btn-block btn-sm" id="add-chat-user-btn" onClick={() => alert('Ajout d\'un contact')}>
                                <i className="fas fa-user-plus"></i> Ajouter un contact
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="chat-main">
                    <div className="chat-header">
                        <div className="chat-recipient" id="current-chat-recipient">
                            {selectedUser ? (
                                <>
                                    <div className="chat-user-avatar">{getInitials(selectedUser.name)}</div>
                                    <div>
                                        <h4>{selectedUser.name}</h4>
                                        <p>{getRoleLabel(selectedUser.role)}</p>
                                    </div>
                                </>
                            ) : (
                                <p>Sélectionnez un contact pour commencer</p>
                            )}
                        </div>
                        <div>
                            <button className="btn btn-sm btn-info" id="start-voice-call-btn" onClick={() => alert('Appel vocal en cours...')}>
                                <i className="fas fa-phone"></i> Appel
                            </button>
                            {hasPermission('admin') && (
                                <button className="btn btn-sm btn-warning" id="clear-chat-btn" onClick={handleClearChat}>
                                    <i className="fas fa-trash"></i> Effacer
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="chat-messages" id="chat-messages">
                        {chatMessages.map(msg => (
                            <Message key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chat-input">
                        <textarea
                            className="message-input"
                            id="message-input"
                            placeholder="Tapez votre message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!selectedUser}
                        />
                        <button className="btn" id="send-message-btn" onClick={handleSendMessage} disabled={!selectedUser}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                        <button className="btn btn-info" id="attach-file-btn" onClick={() => alert('Pièce jointe ajoutée')}>
                            <i className="fas fa-paperclip"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommunicationPage;