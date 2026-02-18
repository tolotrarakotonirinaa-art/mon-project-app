export const DEFAULT_DATA = {
    users: [
        { id: 1, name: "Admin User", email: "admin@devenviron.com", role: "admin", joinDate: "2023-01-15", password: "password123" },
        { id: 2, name: "John Doe", email: "john.doe@example.com", role: "dev", joinDate: "2023-03-10", password: "password123" },
        { id: 3, name: "Marie Dubois", email: "marie.dubois@example.com", role: "dev", joinDate: "2023-04-22", password: "password123" },
        { id: 4, name: "Jean Martin", email: "jean.martin@example.com", role: "dev", joinDate: "2023-05-05", password: "password123" },
        { id: 5, name: "Sophie Lambert", email: "sophie.lambert@example.com", role: "client", joinDate: "2023-06-18", password: "password123" }
    ],
    projects: [
        { id: 1, name: "Site E-commerce", description: "Développement d'un site e-commerce avec React et Node.js", status: "active", progress: 75, startDate: "2023-10-01", endDate: "2023-12-15", team: ["JD", "MD", "SL"] },
        { id: 2, name: "API de paiement", description: "API de traitement des paiements avec Stripe et Node.js", status: "active", progress: 60, startDate: "2023-09-15", endDate: "2023-11-30", team: ["JM", "AL"] },
        { id: 3, name: "Application mobile", description: "Application React Native pour iOS et Android", status: "pending", progress: 20, startDate: "2023-11-01", endDate: "2024-02-28", team: ["JD", "SL"] }
    ],
    tasks: [
        { id: 1, title: "Corriger bug login", project: "Site E-commerce", status: "todo", priority: "high", dueDate: "2023-11-10", assignee: "JD", createdAt: new Date().toISOString() },
        { id: 2, title: "Implémenter API", project: "API de paiement", status: "inprogress", priority: "medium", dueDate: "2023-11-15", assignee: "JM", createdAt: new Date().toISOString() },
        { id: 3, title: "Tests unitaires", project: "Application mobile", status: "done", priority: "low", dueDate: "2023-11-05", assignee: "SL", createdAt: new Date().toISOString() },
        { id: 4, title: "Design responsive", project: "Site E-commerce", status: "todo", priority: "medium", dueDate: "2023-11-12", assignee: "MD", createdAt: new Date().toISOString() },
        { id: 5, title: "Documentation API", project: "API de paiement", status: "inprogress", priority: "low", dueDate: "2023-11-20", assignee: "AL", createdAt: new Date().toISOString() }
    ],
    repositories: [
        { id: 1, name: "frontend-ecommerce", description: "Interface utilisateur React pour le site e-commerce", visibility: "public", stars: 12, forks: 3, lastUpdate: "Il y a 2 jours" },
        { id: 2, name: "backend-api", description: "API Node.js avec Express et MongoDB", visibility: "private", stars: 8, forks: 1, lastUpdate: "Il y a 1 jour" },
        { id: 3, name: "mobile-app", description: "Application React Native", visibility: "private", stars: 5, forks: 0, lastUpdate: "Il y a 3 jours" }
    ],
    environments: [
        { id: 1, name: "Développement", type: "dev", status: "running", url: "https://dev.example.com", version: "1.2.0", lastDeploy: "2023-11-05" },
        { id: 2, name: "Staging", type: "staging", status: "running", url: "https://staging.example.com", version: "1.1.5", lastDeploy: "2023-11-03" },
        { id: 3, name: "Production", type: "production", status: "running", url: "https://example.com", version: "1.1.0", lastDeploy: "2023-10-28" }
    ],
    activities: [
        { id: 1, user: "Marie Dubois", action: "a poussé du code", icon: "code-commit", time: "Il y a 15 minutes" },
        { id: 2, user: "Jean Martin", action: "a complété une tâche", icon: "tasks", time: "Il y a 1 heure" },
        { id: 3, user: "Sophie Lambert", action: "a commenté", icon: "comment", time: "Il y a 2 heures" }
    ],
    chatMessages: [
        { id: 1, sender: "Marie Dubois", message: "Bonjour à tous, avez-vous terminé les tests pour la version 1.2?", time: "14:20", type: "received" },
        { id: 2, sender: "Vous", message: "Oui, tous les tests passent. Je prépare le déploiement.", time: "14:22", type: "sent" },
        { id: 3, sender: "Sophie Lambert", message: "Parfait! N'oubliez pas de mettre à jour la documentation.", time: "14:25", type: "received" }
    ],
    pipelineLogs: [
        "[14:30] Démarrage du pipeline CI/CD...",
        "[14:31] Récupération du code depuis Git...",
        "[14:32] Installation des dépendances...",
        "[14:35] Exécution des tests unitaires...",
        "[14:40] 152 tests passés, 0 échecs"
    ],
    pipelineStatus: { 
        development: "completed", 
        tests: "active", 
        build: "pending", 
        deployment: "pending" 
    }
};