import React from 'react';

const DevToolCard = ({ tool }) => {
    return (
        <div className="dev-tool-card">
            <div className="dev-tool-icon">
                <i className={`fas fa-${tool.icon}`}></i>
            </div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
            <button className={`btn btn-sm ${tool.buttonClass}`} onClick={tool.onClick}>
                <i className={`fas fa-${tool.buttonIcon || 'play'}`}></i> {tool.buttonLabel}
            </button>
        </div>
    );
};

export default DevToolCard;