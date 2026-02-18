import React, { useState, useEffect } from 'react';

const Alert = ({ message, type = 'info', duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!visible) return null;

    const iconMap = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        danger: 'times-circle',
        info: 'info-circle'
    };

    return (
        <div className={`alert alert-${type}`}>
            <i className={`fas fa-${iconMap[type]}`}></i>
            {message}
        </div>
    );
};

export default Alert;