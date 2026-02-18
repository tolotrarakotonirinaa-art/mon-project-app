import React, { useState, useRef, useEffect } from 'react';

const Terminal = ({ onClose }) => {
    const [history, setHistory] = useState([]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const inputRef = useRef(null);
    const outputRef = useRef(null);

    useEffect(() => {
        // Initialiser le terminal
        addOutput('Bienvenue dans le terminal DevEnviron');
        addOutput('Tapez \'help\' pour voir les commandes disponibles');
        
        // Focus sur l'input
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        // Scroll vers le bas
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [history]);

    const addOutput = (text) => {
        setHistory(prev => [...prev, { type: 'output', content: text }]);
    };

    const addCommand = (cmd) => {
        setHistory(prev => [...prev, { type: 'command', content: `$ ${cmd}` }]);
    };

    const commands = {
        help: () => {
            addOutput(`
Commandes disponibles:
- help: Afficher cette aide
- clear: Effacer le terminal
- ls: Lister les fichiers
- pwd: Afficher le répertoire courant
- whoami: Afficher l'utilisateur courant
- date: Afficher la date et l'heure
- echo [texte]: Afficher du texte
- projects: Lister les projets
- tasks: Lister les tâches
- git status: État du dépôt Git
- npm install: Installer les dépendances
- npm start: Démarrer l'application
            `);
        },
        clear: () => {
            setHistory([]);
        },
        ls: () => {
            addOutput(`
drwxr-xr-x 6 user user 4096 Nov 10 14:30 .
drwxr-xr-x 3 user user 4096 Nov  1 10:15 ..
-rw-r--r-- 1 user user  231 Nov 10 14:30 index.html
-rw-r--r-- 1 user user  567 Nov 10 14:30 style.css
-rw-r--r-- 1 user user 1234 Nov 10 14:30 script.js
drwxr-xr-x 2 user user 4096 Nov 10 14:30 src
drwxr-xr-x 2 user user 4096 Nov 10 14:30 public
-rw-r--r-- 1 user user  123 Nov 10 14:30 package.json
            `);
        },
        pwd: () => {
            addOutput('/home/user/dev-environ-project');
        },
        whoami: () => {
            addOutput('developer');
        },
        date: () => {
            addOutput(new Date().toString());
        },
        echo: (args) => {
            addOutput(args.join(' '));
        },
        projects: () => {
            addOutput('Site E-commerce - 75% - active');
            addOutput('API de paiement - 60% - active');
            addOutput('Application mobile - 20% - pending');
        },
        tasks: () => {
            addOutput('Corriger bug login [todo] - Site E-commerce');
            addOutput('Implémenter API [inprogress] - API de paiement');
            addOutput('Tests unitaires [done] - Application mobile');
        },
        'git status': () => {
            addOutput(`
Sur la branche main
Votre branche est à jour avec 'origin/main'.

rien à valider, la copie de travail est propre
            `);
        },
        'npm install': () => {
            addOutput(`
added 125 packages in 3.456s
found 0 vulnerabilities
            `);
        },
        'npm start': () => {
            addOutput(`
> project@1.0.0 start
> node server.js

Server running on port 3000
Development environment ready
            `);
        }
    };

    const handleCommand = (cmd) => {
        if (!cmd.trim()) return;

        addCommand(cmd);
        setCommandHistory(prev => [...prev, cmd]);
        setHistoryIndex(prev => prev + 1);

        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (commands[command]) {
            commands[command](args);
        } else if (commands[cmd]) {
            commands[cmd]();
        } else {
            addOutput(`Commande non trouvée: ${cmd}. Tapez 'help' pour la liste des commandes.`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(currentCommand);
            setCurrentCommand('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex - 1;
                if (newIndex >= 0) {
                    setHistoryIndex(newIndex);
                    setCurrentCommand(commandHistory[newIndex]);
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex + 1;
                if (newIndex < commandHistory.length) {
                    setHistoryIndex(newIndex);
                    setCurrentCommand(commandHistory[newIndex]);
                } else {
                    setHistoryIndex(commandHistory.length);
                    setCurrentCommand('');
                }
            }
        }
    };

    return (
        <div className="dev-terminal" id="integrated-terminal">
            <div className="terminal-header">
                <div className="terminal-title">
                    <i className="fas fa-terminal"></i> Terminal DevEnviron
                </div>
                <div>
                    <button className="btn btn-sm btn-danger" onClick={() => setHistory([])}>
                        <i className="fas fa-trash"></i> Effacer
                    </button>
                    <button className="btn btn-sm btn-warning" onClick={onClose}>
                        <i className="fas fa-times"></i> Fermer
                    </button>
                </div>
            </div>
            <div className="terminal-content" ref={outputRef} id="terminal-output">
                {history.map((item, index) => (
                    <div key={index} className="terminal-line">
                        {item.content}
                    </div>
                ))}
            </div>
            <div className="terminal-input-area mt-20">
                <span className="terminal-prompt">$</span>
                <input
                    type="text"
                    className="terminal-input"
                    id="terminal-input"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    placeholder="Tapez une commande..."
                />
            </div>
        </div>
    );
};

export default Terminal;