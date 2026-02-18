import React, { useState } from 'react';

const CodeEditor = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [code, setCode] = useState({
        0: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Projet</title>
</head>
<body>
    <h1>Hello DevEnviron!</h1>
</body>
</html>`,
        1: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #2d5f7d;
    text-align: center;
}`,
        2: `console.log('Hello DevEnviron!');

function greet(name) {
    return \`Bonjour, \${name}!\`;
}

document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('h1');
    if (title) {
        title.addEventListener('click', () => {
            alert(greet('Utilisateur'));
        });
    }
});`
    });

    const tabs = [
        { name: 'index.html', icon: 'html5' },
        { name: 'style.css', icon: 'css3-alt' },
        { name: 'script.js', icon: 'js' }
    ];

    const handleSave = () => {
        alert('Code enregistré avec succès!');
    };

    return (
        <div className="code-editor">
            <div className="editor-header">
                <div className="editor-tabs">
                    {tabs.map((tab, index) => (
                        <div
                            key={index}
                            className={`editor-tab ${activeTab === index ? 'active' : ''}`}
                            onClick={() => setActiveTab(index)}
                        >
                            <i className={`fab fa-${tab.icon}`}></i> {tab.name}
                        </div>
                    ))}
                </div>
                <div>
                    <button className="btn btn-sm btn-success" onClick={handleSave}>
                        <i className="fas fa-save"></i> Enregistrer
                    </button>
                    <button className="btn btn-sm btn-warning" onClick={onClose}>
                        <i className="fas fa-times"></i> Fermer
                    </button>
                </div>
            </div>
            <div className="editor-content">
                <div className="editor-line-numbers">
                    {code[activeTab].split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                <div 
                    className="editor-code" 
                    contentEditable="true" 
                    id="editor-code"
                    onBlur={(e) => setCode({ ...code, [activeTab]: e.target.textContent })}
                    suppressContentEditableWarning={true}
                >
                    {code[activeTab]}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;