import React from 'react';

const DocsSection = ({ id, content, isActive }) => {
    return (
        <div 
            className={`docs-section ${isActive ? '' : 'hidden'}`} 
            id={`${id}-doc`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default DocsSection;