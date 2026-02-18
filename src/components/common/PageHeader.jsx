import React from 'react';

const PageHeader = ({ title, icon, actions = [] }) => {
    return (
        <div className="page-header">
            <h1 className="page-title">
                <i className={`fas fa-${icon}`}></i>
                {title}
            </h1>
            {actions.length > 0 && (
                <div className="page-actions">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            className={`btn ${action.className || ''}`}
                            onClick={action.onClick}
                        >
                            {action.icon && <i className={`fas fa-${action.icon}`}></i>}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PageHeader;