'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

// --- Types ---
type Server = {
    id: string;
    name: string;
    icon?: string;
};

type Channel = {
    id: string;
    name: string;
    type: 'text' | 'voice';
};

type Message = {
    id: string;
    user: string;
    avatar?: string;
    content: string;
    timestamp: string;
    color?: string;
};

type Member = {
    id: string;
    username: string;
    avatar?: string;
    status: 'online' | 'idle' | 'dnd' | 'offline';
    color?: string;
    role?: string;
};

// --- Mock Data ---
const MOCK_SERVERS: Server[] = [
    { id: '1', name: 'SSB Official', icon: 'https://i.imgur.com/pGowI7G.png' },
    { id: '2', name: 'Gaming Lounge' },
    { id: '3', name: 'Music Hub' },
    { id: '4', name: 'Dev Corner' },
];

const MOCK_CHANNELS: Channel[] = [
    { id: '1', name: 'general', type: 'text' },
    { id: '2', name: 'announcements', type: 'text' },
    { id: '3', name: 'memes', type: 'text' },
    { id: '4', name: 'General Voice', type: 'voice' },
    { id: '5', name: 'Gaming 1', type: 'voice' },
];

const MOCK_MEMBERS: Member[] = [
    { id: '1', username: 'Reese', status: 'online', color: '#53FC18', role: 'Owner' },
    { id: '2', username: 'Moderator1', status: 'dnd', color: '#ff4444', role: 'Mod' },
    { id: '3', username: 'User123', status: 'online', color: '#888' },
    { id: '4', username: 'GamerGuy', status: 'idle', color: '#888' },
    { id: '5', username: 'Newbie', status: 'offline', color: '#888' },
];

const MOCK_MESSAGES: Message[] = [
    { id: '1', user: 'Reese', content: 'Welcome to HypeChat! 🚀', timestamp: 'Today at 2:30 PM', color: '#53FC18' },
    { id: '2', user: 'Moderator1', content: 'Make sure to read the rules.', timestamp: 'Today at 2:31 PM', color: '#ff4444' },
    { id: '3', user: 'User123', content: 'This looks just like Discord!', timestamp: 'Today at 2:35 PM' },
];

export default function HypeChatPage() {
    const [activeServer, setActiveServer] = useState<string>('1');
    const [activeChannel, setActiveChannel] = useState<string>('1');
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [input, setInput] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            user: 'You', // In real app, fetch from UserContext
            content: input,
            timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: '#53FC18'
        };

        setMessages([...messages, newMsg]);
        setInput('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#36393f', overflow: 'hidden' }}>
            <Header /> {/* Keeping header for global nav */}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: '-20px' /* Adjust for header padding/flow if needed */ }}>

                {/* 1. Server Sidebar */}
                <div style={{
                    width: '72px',
                    backgroundColor: '#202225',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 0',
                    gap: '8px',
                    overflowY: 'auto'
                }}>
                    {MOCK_SERVERS.map(server => (
                        <div key={server.id}
                            onClick={() => setActiveServer(server.id)}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: activeServer === server.id ? '16px' : '24px',
                                backgroundColor: activeServer === server.id ? '#53FC18' : '#36393f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: activeServer === server.id ? '#000' : '#fff',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                            title={server.name}
                        >
                            {server.icon ? (
                                <img src={server.icon} alt={server.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                server.name.substring(0, 2).toUpperCase()
                            )}

                            {/* Selecting Indicator */}
                            {activeServer === server.id && (
                                <div style={{
                                    position: 'absolute',
                                    left: '-4px',
                                    top: '10px',
                                    bottom: '10px',
                                    width: '8px',
                                    backgroundColor: '#fff',
                                    borderRadius: '0 4px 4px 0'
                                }} />
                            )}
                        </div>
                    ))}

                    {/* Add Server Button */}
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '24px',
                        backgroundColor: '#36393f', color: '#2ecc71',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s'
                    }}>+</div>
                </div>

                {/* 2. Channel Sidebar */}
                <div style={{
                    width: '240px',
                    backgroundColor: '#2f3136',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Server Header */}
                    <div style={{
                        height: '48px',
                        borderBottom: '1px solid #202225',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 1px 0 rgba(4,4,5,0.2),0 1.5px 0 rgba(6,6,7,0.05),0 2px 0 rgba(4,4,5,0.05)'
                    }}>
                        <span>{MOCK_SERVERS.find(s => s.id === activeServer)?.name}</span>
                        <span>⌄</span>
                    </div>

                    {/* Channels */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        <div style={{ color: '#8e9297', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                            Start Here
                        </div>
                        {MOCK_CHANNELS.map(channel => (
                            <div key={channel.id}
                                onClick={() => setActiveChannel(channel.id)}
                                style={{
                                    padding: '6px 8px',
                                    margin: '2px 0',
                                    borderRadius: '4px',
                                    backgroundColor: activeChannel === channel.id ? 'rgba(79,84,92, 0.6)' : 'transparent',
                                    color: activeChannel === channel.id ? '#fff' : '#8e9297',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span style={{ fontSize: '18px', color: '#8e9297' }}>
                                    {channel.type === 'text' ? '#' : '🔊'}
                                </span>
                                <span style={{ fontWeight: 500 }}>{channel.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* User Controls Panel (Bottom) */}
                    <div style={{
                        height: '52px',
                        backgroundColor: '#292b2f',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        color: '#fff'
                    }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#53FC18', marginRight: '8px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>You</div>
                            <div style={{ fontSize: '12px', color: '#b9bbbe' }}>#1337</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span>🎙️</span>
                            <span>🎧</span>
                            <span>⚙️</span>
                        </div>
                    </div>
                </div>

                {/* 3. Main Chat Area */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#36393f',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Channel Header */}
                    <div style={{
                        height: '48px',
                        borderBottom: '1px solid #26272d',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        color: '#fff',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 0 rgba(4,4,5,0.2),0 1.5px 0 rgba(6,6,7,0.05),0 2px 0 rgba(4,4,5,0.05)'
                    }}>
                        <span style={{ fontSize: '24px', color: '#72767d', marginRight: '8px', lineHeight: '24px' }}>#</span>
                        {MOCK_CHANNELS.find(c => c.id === activeChannel)?.name}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: msg.color || '#7289da',
                                    flexShrink: 0
                                }} />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ color: msg.color || '#fff', fontWeight: 'bold' }}>{msg.user}</span>
                                        <span style={{ color: '#72767d', fontSize: '12px' }}>{msg.timestamp}</span>
                                    </div>
                                    <div style={{ color: '#dcddde', marginTop: '4px', lineHeight: '1.4' }}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '0 16px 24px 16px' }}>
                        <form onSubmit={handleSendMessage} style={{
                            backgroundColor: '#40444b',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <button type="button" style={{ background: 'none', border: 'none', color: '#b9bbbe', fontSize: '24px', marginRight: '16px', cursor: 'pointer' }}>+</button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Message #${MOCK_CHANNELS.find(c => c.id === activeChannel)?.name}`}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#fff',
                                    flex: 1,
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
                                <span>🎁</span>
                                <span>GIF</span>
                                <span>😊</span>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 4. Member List Sidebar */}
                <div style={{
                    width: '240px',
                    backgroundColor: '#2f3136',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    overflowY: 'auto'
                }}>
                    {['Owner', 'Mod', 'Online', 'Offline'].map(group => {
                        const members = MOCK_MEMBERS.filter(m => {
                            if (group === 'Owner') return m.role === 'Owner';
                            if (group === 'Mod') return m.role === 'Mod';
                            if (group === 'Online') return !m.role && m.status !== 'offline';
                            return !m.role && m.status === 'offline';
                        });

                        if (members.length === 0) return null;

                        return (
                            <div key={group} style={{ marginBottom: '24px' }}>
                                <div style={{
                                    color: '#8e9297', fontSize: '12px', fontWeight: 'bold',
                                    textTransform: 'uppercase', marginBottom: '8px'
                                }}>
                                    {group} — {members.length}
                                </div>
                                {members.map(member => (
                                    <div key={member.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '8px', borderRadius: '4px',
                                        cursor: 'pointer',
                                        opacity: member.status === 'offline' ? 0.3 : 1
                                    }}
                                        className="hover-bg-gray"
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                backgroundColor: member.color || '#7289da'
                                            }} />
                                            {member.status !== 'offline' && (
                                                <div style={{
                                                    position: 'absolute', bottom: '-2px', right: '-2px',
                                                    width: '10px', height: '10px', borderRadius: '50%',
                                                    backgroundColor: member.status === 'online' ? '#3ba55c' :
                                                        member.status === 'idle' ? '#faa61a' : '#ed4245',
                                                    border: '3px solid #2f3136'
                                                }} />
                                            )}
                                        </div>
                                        <span style={{
                                            color: member.color || (member.status === 'offline' ? '#8e9297' : '#fff'),
                                            fontWeight: 500
                                        }}>
                                            {member.username}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

            </div>

            <style jsx global>{`
                .hover-bg-gray:hover {
                    background-color: rgba(79,84,92, 0.32);
                }
                /* Scrollbar Styling */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background-color: #2b2d31;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #1a1b1e;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
