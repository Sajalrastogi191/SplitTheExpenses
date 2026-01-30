import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeUser();
    }, []);

    const initializeUser = async () => {
        try {
            // Check if we have a stored userId
            let storedUserId = await AsyncStorage.getItem('userId');

            if (!storedUserId) {
                // Generate a new unique user ID
                storedUserId = await Crypto.randomUUID();
                await AsyncStorage.setItem('userId', storedUserId);
            }

            setUserId(storedUserId);
        } catch (error) {
            console.error('Error initializing user:', error);
            // Fallback to a random ID if something goes wrong
            const fallbackId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setUserId(fallbackId);
        } finally {
            setLoading(false);
        }
    };

    const resetUser = async () => {
        try {
            const newUserId = await Crypto.randomUUID();
            await AsyncStorage.setItem('userId', newUserId);
            setUserId(newUserId);
        } catch (error) {
            console.error('Error resetting user:', error);
        }
    };

    return (
        <UserContext.Provider value={{ userId, loading, resetUser }}>
            {children}
        </UserContext.Provider>
    );
};
