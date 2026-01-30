import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the host IP from Expo's manifest (works for both emulator and physical devices)
const getBaseUrl = () => {
    // For Expo Go, use the debuggerHost which contains the dev machine's IP
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        const host = debuggerHost.split(':')[0]; // Get just the IP part
        return `http://${host}:5000/api`;
    }
    // Fallback for web or production
    return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add userId to every request
api.interceptors.request.use(async (config) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
            config.headers['x-user-id'] = userId;
        }
    } catch (error) {
        console.error('Error getting userId for request:', error);
    }
    return config;
});

// User
export const initUser = (oderId) => api.post('/user/init', { oderId });

// People
export const getPeople = () => api.get('/people');
export const addPerson = (name) => api.post('/people', { name });

// Friends
export const getFriends = () => api.get('/friends');
export const addFriend = (name) => api.post('/friends', { name });
export const deleteFriend = (id) => api.delete(`/friends/${id}`);

// Groups
export const getGroups = () => api.get('/groups');
export const addGroup = (data) => api.post('/groups', data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const addExpense = (expenseData) => api.post('/expenses', expenseData);

// Activity
export const getActivity = () => api.get('/activity');

// Settlement
export const getSettlement = () => api.get('/settlement');

// Reset
export const resetData = () => api.post('/reset');

// Journeys
export const getJourneys = () => api.get('/journeys');
export const archiveJourney = (name) => api.post('/journeys/archive', { name });

export default api;
