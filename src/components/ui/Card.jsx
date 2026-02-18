import React from 'react';

const Card = ({ children, className = '', title, actions, footer }) => {
    return (
        <div className={`dashboard-card ${className}`}>
            {(title || actions) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
};

export default Card;