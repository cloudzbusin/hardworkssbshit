'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            shortcuts.forEach(shortcut => {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
}

// Default shortcuts for the platform
export const defaultShortcuts: KeyboardShortcut[] = [
    {
        key: 'f',
        description: 'Toggle fullscreen',
        action: () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    },
    {
        key: 'm',
        description: 'Toggle mute',
        action: () => {
            const video = document.querySelector('video, iframe');
            if (video && 'muted' in video) {
                (video as HTMLVideoElement).muted = !(video as HTMLVideoElement).muted;
            }
        }
    },
    {
        key: 't',
        description: 'Toggle theater mode',
        action: () => {
            const event = new CustomEvent('toggleTheaterMode');
            window.dispatchEvent(event);
        }
    },
    {
        key: 'c',
        description: 'Toggle chat',
        action: () => {
            const event = new CustomEvent('toggleChat');
            window.dispatchEvent(event);
        }
    },
    {
        key: '/',
        description: 'Focus search',
        action: () => {
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
            searchInput?.focus();
        }
    },
    {
        key: 'ArrowLeft',
        description: 'Seek backward 5s',
        action: () => {
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) video.currentTime = Math.max(0, video.currentTime - 5);
        }
    },
    {
        key: 'ArrowRight',
        description: 'Seek forward 5s',
        action: () => {
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) video.currentTime = Math.min(video.duration, video.currentTime + 5);
        }
    },
    {
        key: ' ',
        description: 'Play/Pause',
        action: () => {
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) {
                if (video.paused) video.play();
                else video.pause();
            }
        }
    },
    {
        key: 'n',
        ctrl: true,
        description: 'Open notifications',
        action: () => {
            const event = new CustomEvent('openNotifications');
            window.dispatchEvent(event);
        }
    },
    {
        key: 'h',
        ctrl: true,
        description: 'Go to homepage',
        action: () => {
            window.location.href = '/';
        }
    }
];
