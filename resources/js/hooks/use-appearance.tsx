import { useEffect } from 'react';

export type Appearance = 'light';

const applyTheme = () => {
    // Always apply light theme - remove dark class if it exists
    document.documentElement.classList.remove('dark');
};

export function initializeTheme() {
    // Always initialize to light theme
    applyTheme();
    
    // Clean up any stored theme preferences
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('appearance', 'light');
    }
}

export function useAppearance() {
    const appearance: Appearance = 'light';

    useEffect(() => {
        // Ensure light theme is always applied
        applyTheme();
        
        // Clean up any stored theme preferences
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('appearance', 'light');
        }
    }, []);

    // Return a no-op updateAppearance function for compatibility
    const updateAppearance = () => {
        // Always light mode, do nothing
    };

    return { appearance, updateAppearance } as const;
}
