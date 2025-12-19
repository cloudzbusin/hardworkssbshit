'use client';

import { useState, useEffect } from 'react';

export function useTheaterMode() {
    const [isTheaterMode, setIsTheaterMode] = useState(false);

    useEffect(() => {
        const handleToggle = () => setIsTheaterMode(prev => !prev);
        window.addEventListener('toggleTheaterMode', handleToggle);
        return () => window.removeEventListener('toggleTheaterMode', handleToggle);
    }, []);

    const toggleTheaterMode = () => {
        setIsTheaterMode(!isTheaterMode);
    };

    return { isTheaterMode, toggleTheaterMode };
}

interface TheaterModeWrapperProps {
    children: React.ReactNode;
    isTheaterMode: boolean;
}

export function TheaterModeWrapper({ children, isTheaterMode }: TheaterModeWrapperProps) {
    return (
        <div style={{
            position: isTheaterMode ? 'fixed' : 'relative',
            top: isTheaterMode ? 0 : 'auto',
            left: isTheaterMode ? 0 : 'auto',
            width: isTheaterMode ? '100vw' : '100%',
            height: isTheaterMode ? '100vh' : 'auto',
            zIndex: isTheaterMode ? 9999 : 'auto',
            background: isTheaterMode ? '#000' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        }}>
            {children}
        </div>
    );
}

interface TheaterModeButtonProps {
    isTheaterMode: boolean;
    onToggle: () => void;
}

export function TheaterModeButton({ isTheaterMode, onToggle }: TheaterModeButtonProps) {
    return (
        <button
            onClick={onToggle}
            style={{
                background: isTheaterMode ? '#53FC18' : 'rgba(83, 252, 24, 0.1)',
                border: '1px solid rgba(83, 252, 24, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: isTheaterMode ? '#000' : '#53FC18',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
            title="Toggle Theater Mode (T)"
        >
            <span>{isTheaterMode ? '📺' : '🎬'}</span>
            <span>{isTheaterMode ? 'Exit Theater' : 'Theater Mode'}</span>
        </button>
    );
}
