import React, { createContext, useState, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
    theme: MD3LightTheme,
});

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    const md3Theme = useMemo(() => {
        // Customizing colors to match "Hisaab" aesthetics
        const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                primary: '#6366f1', // Indigo 500
                secondary: '#10b981', // Emerald 500
                tertiary: '#f43f5e', // Rose 500
                background: isDark ? '#0f172a' : '#f8fafc',
                surface: isDark ? '#1e293b' : '#ffffff',
            },
        };
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme: md3Theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
