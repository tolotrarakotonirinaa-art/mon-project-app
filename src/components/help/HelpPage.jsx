import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal';

const HelpPage = () => {
    const { hasPermission } = useAuth();
    const [showContactModal, setShowContactModal] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "Comment créer un nouveau projet?",
            answer: "Pour créer un nouveau projet, allez dans le tableau de bord et cliquez sur le bouton 'Nouveau projet'. Remplissez les informations requises et cliquez sur 'Créer'."
        },
        {
            id: 2,
            question: "Comment inviter des membres à mon projet?",
            answer: "Dans la page d'un projet, cliquez sur l'onglet 'Membres' puis sur 'Inviter des membres'. Entrez les adresses email des personnes à inviter."
        },
        {
            id: 3,
            question: "Comment configurer le pipeline CI/CD?",
            answer: "Allez dans la section 'Pipeline CI/CD' de votre projet. Cliquez sur 'Configurer le pipeline' et suivez les étapes pour définir les étapes de build, test et déploiement."
        },
        {
            id: 4,
            question: "Comment réinitialiser mon mot de passe?",
            answer: "Allez dans la page de connexion et cliquez sur 'Mot de passe oublié'. Suivez les instructions envoyées par email pour réinitialiser votre mot de passe."
        }
    ];

    const toggleFaq = (id) => {
        setActiveFaq(activeFaq === id ? null : id);
    };

    return (
        <>
            <PageHeader
                title="Aide & Support"
                icon="question-circle"
                actions={[
                    {
                        label: 'Rechercher',
                        icon: 'search',
                        onClick: () => alert('Recherche dans l\'aide'),
                        className: 'btn-info'
                    }
                ]}
            />
            
            <div className="help-container">
                <div className="help-card">
                    <div className="help-icon">
                        <i className="fas fa-book"></i>
                    </div>
                    <h3>Documentation</h3>
                    <p>Consultez notre documentation complète pour apprendre à utiliser toutes les fonctionnalités de la plateforme.</p>
                    <button className="btn" onClick={() => alert('Accès à la documentation')}>
                        <i className="fas fa-external-link-alt"></i> Accéder
                    </button>
                </div>
                
                <div className="help-card">
                    <div className="help-icon">
                        <i className="fas fa-video"></i>
                    </div>
                    <h3>Tutoriels vidéo</h3>
                    <p>Regardez nos tutoriels vidéo pour maîtriser rapidement la plateforme.</p>
                    <button className="btn" onClick={() => alert('Ouverture des tutoriels vidéo')}>
                        <i className="fas fa-play-circle"></i> Regarder
                    </button>
                </div>
                
                <div className="help-card">
                    <div className="help-icon">
                        <i className="fas fa-question"></i>
                    </div>
                    <h3>FAQ</h3>
                    <p>Trouvez des réponses aux questions les plus fréquentes.</p>
                    <button className="btn" onClick={() => alert('FAQ ouverte')}>
                        <i className="fas fa-search"></i> Consulter
                    </button>
                </div>
                
                <div className="help-card">
                    <div className="help-icon">
                        <i className="fas fa-headset"></i>
                    </div>
                    <h3>Support technique</h3>
                    <p>Contactez notre équipe de support pour toute question ou problème technique.</p>
                    <button className="btn btn-info" onClick={() => setShowContactModal(true)}>
                        <i className="fas fa-envelope"></i> Contacter
                    </button>
                </div>
            </div>
            
            <div className="faq-container mt-30">
                <h3>Questions fréquentes (FAQ)</h3>
                <div id="faq-list">
                    {faqs.map(faq => (
                        <div key={faq.id} className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`}>
                            <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
                                <span>{faq.question}</span>
                                <i className={`fas fa-chevron-${activeFaq === faq.id ? 'up' : 'down'}`}></i>
                            </div>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                title="Contactez le support"
                footerButtons={[
                    {
                        text: 'Annuler',
                        class: 'btn-warning',
                        onClick: () => setShowContactModal(false)
                    },
                    {
                        text: 'Envoyer',
                        class: 'btn-success',
                        onClick: () => {
                            setShowContactModal(false);
                            alert('Message envoyé au support!');
                        }
                    }
                ]}
            >
                <div className="form-group">
                    <label>Sujet</label>
                    <input type="text" id="support-subject" className="form-control" />
                </div>
                <div className="form-group">
                    <label>Message</label>
                    <textarea id="support-message" className="form-control" rows="5"></textarea>
                </div>
            </Modal>
        </>
    );
};

export default HelpPage;