import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = (user) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const hasPermission = (requiredRole) => {
        if (!currentUser) return false;
        if (requiredRole === 'any') return true;
        if (requiredRole === 'admin') return currentUser.role === 'admin';
        if (requiredRole === 'dev') return currentUser.role === 'dev' || currentUser.role === 'admin';
        if (requiredRole === 'client') return currentUser.role === 'client';
        return false;
    };

    const value = {
        currentUser,
        isAuthenticated,
        login,
        logout,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};