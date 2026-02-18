import React from 'react';

const Message = ({ message }) => {
    return (
        <div className={`message ${message.type}`}>
            <div>{message.message}</div>
            <div className="message-time">
                {message.time} - {message.sender}
            </div>
        </div>
    );
};

export default Message;