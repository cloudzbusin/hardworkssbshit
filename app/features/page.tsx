'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';

export default function FeaturesPage() {
    const { user } = useUser();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            // Fetch various stats
            const [achievements, streak, referral, leaderboard] = await Promise.all([
                fetch('/api/achievements').then(r => r.json()),
                fetch('/api/rewards/daily').then(r => r.json()),
                fetch('/api/referral').then(r => r.json()),
                fetch('/api/leaderboard?type=points&limit=10').then(r => r.json())
            ]);

            setStats({ achievements, streak, referral, leaderboard });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const claimDailyReward = async () => {
        try {
            const res = await fetch('/api/rewards/daily', { method: 'POST' });
            const data = await res.json();
            if (data.reward) {
                alert(`🎉 Claimed ${data.reward} points! Streak: ${data.streak} days`);
                fetchUserStats();
            } else {
                alert(data.error || 'Already claimed today!');
            }
        } catch (error) {
            console.error('Failed to claim reward:', error);
        }
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
                <Header />
                <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                    <h1 style={{ color: '#53FC18', fontSize: '3rem', marginBottom: '20px' }}>
                        🚀 Features Dashboard
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.2rem' }}>
                        Please log in to access features
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
            <Header />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 20px 40px' }}>
                {/* Page Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        background: 'linear-gradient(135deg, #53FC18 0%, #45d013 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '10px'
                    }}>
                        🚀 Features Dashboard
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>
                        Access all your new features in one place
                    </p>
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    {/* Daily Reward */}
                    <FeatureCard
                        icon="🎁"
                        title="Daily Reward"
                        description={stats?.streak?.canClaim ? 'Claim your daily reward!' : `Next claim: ${new Date(stats?.streak?.nextClaimAt || 0).toLocaleTimeString()}`}
                        action={stats?.streak?.canClaim ? claimDailyReward : undefined}
                        actionLabel="Claim Reward"
                        stats={`Streak: ${stats?.streak?.current || 0} days`}
                    />

                    {/* Achievements */}
                    <FeatureCard
                        icon="🏆"
                        title="Achievements"
                        description="View your unlocked achievements"
                        link="/features/achievements"
                        stats={`${stats?.achievements?.achievements?.filter((a: any) => a.unlocked).length || 0}/12 unlocked`}
                    />

                    {/* Referrals */}
                    <FeatureCard
                        icon="👥"
                        title="Referral Program"
                        description="Invite friends and earn rewards"
                        link="/features/referrals"
                        stats={`Code: ${stats?.referral?.code || 'Loading...'}`}
                    />

                    {/* Leaderboard */}
                    <FeatureCard
                        icon="📊"
                        title="Leaderboards"
                        description="See top users and your ranking"
                        link="/features/leaderboard"
                        stats="View Rankings"
                    />

                    {/* Watch History */}
                    <FeatureCard
                        icon="📺"
                        title="Watch History"
                        description="View your watching history"
                        link="/features/history"
                        stats="View History"
                    />

                    {/* Trending */}
                    <FeatureCard
                        icon="🔥"
                        title="Trending"
                        description="See what's hot right now"
                        link="/features/trending"
                        stats="Explore Trending"
                    />
                </div>

                {/* Feature Categories */}
                <div style={{ marginTop: '60px' }}>
                    <h2 style={{ color: '#53FC18', marginBottom: '30px', fontSize: '2rem' }}>
                        All Features
                    </h2>

                    <div style={{ display: 'grid', gap: '30px' }}>
                        {/* Engagement Features */}
                        <FeatureSection
                            title="🎮 Engagement & Rewards"
                            features={[
                                { name: 'Daily Login Rewards', status: 'active', link: '#daily' },
                                { name: 'Achievement System', status: 'active', link: '/features/achievements' },
                                { name: 'Referral Program', status: 'active', link: '/features/referrals' },
                                { name: 'Leaderboards', status: 'active', link: '/features/leaderboard' }
                            ]}
                        />

                        {/* Social Features */}
                        <FeatureSection
                            title="👥 Social Features"
                            features={[
                                { name: 'Follow System', status: 'active', description: 'Follow users & streamers' },
                                { name: 'Notifications', status: 'active', description: 'Bell icon in header' },
                                { name: 'Block & Report', status: 'active', description: 'User moderation tools' },
                                { name: 'Direct Messaging', status: 'coming-soon' }
                            ]}
                        />

                        {/* Content Features */}
                        <FeatureSection
                            title="📺 Content & Discovery"
                            features={[
                                { name: 'Watch History', status: 'active', link: '/features/history' },
                                { name: 'Trending Section', status: 'active', link: '/features/trending' },
                                { name: 'Theater Mode', status: 'active', description: 'Press T on any stream' },
                                { name: 'Keyboard Shortcuts', status: 'active', description: 'F, M, T, C, Space, etc.' }
                            ]}
                        />

                        {/* Moderation */}
                        <FeatureSection
                            title="🛡️ Moderation (Admin Only)"
                            features={[
                                { name: 'Moderation Queue', status: 'active', link: '/admin', admin: true },
                                { name: 'User Reports', status: 'active', admin: true },
                                { name: 'Block Management', status: 'active', admin: true }
                            ]}
                        />

                        {/* Coming Soon */}
                        <FeatureSection
                            title="🚀 Coming Soon"
                            features={[
                                { name: 'Virtual Gifts', status: 'coming-soon' },
                                { name: 'Custom Emotes', status: 'coming-soon' },
                                { name: 'Co-Watching', status: 'coming-soon' },
                                { name: 'Voice Chat', status: 'coming-soon' },
                                { name: 'Creator Dashboard', status: 'coming-soon' },
                                { name: 'RTMP Streaming', status: 'coming-soon' }
                            ]}
                        />
                    </div>
                </div>

                {/* Keyboard Shortcuts Guide */}
                <div style={{
                    marginTop: '60px',
                    padding: '30px',
                    background: 'rgba(83, 252, 24, 0.05)',
                    border: '1px solid rgba(83, 252, 24, 0.2)',
                    borderRadius: '12px'
                }}>
                    <h3 style={{ color: '#53FC18', marginBottom: '20px' }}>⌨️ Keyboard Shortcuts</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <Shortcut keys="F" description="Fullscreen" />
                        <Shortcut keys="M" description="Mute/Unmute" />
                        <Shortcut keys="T" description="Theater Mode" />
                        <Shortcut keys="C" description="Toggle Chat" />
                        <Shortcut keys="Space" description="Play/Pause" />
                        <Shortcut keys="←/→" description="Seek ±5s" />
                        <Shortcut keys="/" description="Focus Search" />
                        <Shortcut keys="Ctrl+N" description="Notifications" />
                        <Shortcut keys="Ctrl+H" description="Homepage" />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, description, link, action, actionLabel, stats }: any) {
    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(83, 252, 24, 0.2)',
            borderRadius: '12px',
            padding: '25px',
            transition: 'all 0.3s ease',
            cursor: link || action ? 'pointer' : 'default'
        }}
            className="feature-card"
            onClick={() => {
                if (action) action();
                else if (link) window.location.href = link;
            }}
        >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{icon}</div>
            <h3 style={{ color: '#53FC18', marginBottom: '10px', fontSize: '1.3rem' }}>{title}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>{description}</p>
            {stats && <div style={{ color: '#53FC18', fontSize: '0.85rem', fontWeight: 'bold' }}>{stats}</div>}
            {(link || action) && (
                <div style={{ marginTop: '15px', color: '#53FC18', fontSize: '0.9rem' }}>
                    {actionLabel || 'View →'}
                </div>
            )}
        </div>
    );
}

function FeatureSection({ title, features }: any) {
    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(83, 252, 24, 0.1)',
            borderRadius: '12px',
            padding: '25px'
        }}>
            <h3 style={{ color: '#53FC18', marginBottom: '20px', fontSize: '1.5rem' }}>{title}</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
                {features.map((feature: any, i: number) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        cursor: feature.link ? 'pointer' : 'default'
                    }}
                        onClick={() => feature.link && (window.location.href = feature.link)}
                    >
                        <div>
                            <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>
                                {feature.name}
                                {feature.admin && <span style={{ color: '#FFD700', fontSize: '0.7rem', marginLeft: '8px' }}>ADMIN</span>}
                            </div>
                            {feature.description && (
                                <div style={{ color: '#666', fontSize: '0.85rem' }}>{feature.description}</div>
                            )}
                        </div>
                        <div style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            background: feature.status === 'active' ? '#53FC18' : '#666',
                            color: feature.status === 'active' ? '#000' : '#fff'
                        }}>
                            {feature.status === 'active' ? 'ACTIVE' : 'SOON'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Shortcut({ keys, description }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <kbd style={{
                background: '#000',
                border: '1px solid #53FC18',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.85rem',
                color: '#53FC18',
                fontFamily: 'monospace',
                minWidth: '60px',
                textAlign: 'center'
            }}>
                {keys}
            </kbd>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>{description}</span>
        </div>
    );
}
