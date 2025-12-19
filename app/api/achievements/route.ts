import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

// Achievement definitions
const ACHIEVEMENTS = [
    {
        id: 'first_watch',
        name: 'First Steps',
        description: 'Watch your first stream',
        icon: '👀',
        category: 'watching',
        rarity: 'common',
        requirement: { type: 'watchTime', value: 1 },
        reward: { points: 10 }
    },
    {
        id: 'hour_watcher',
        name: 'Dedicated Viewer',
        description: 'Watch streams for 1 hour total',
        icon: '⏰',
        category: 'watching',
        rarity: 'common',
        requirement: { type: 'watchTime', value: 3600000 },
        reward: { points: 50 }
    },
    {
        id: 'day_watcher',
        name: 'Binge Watcher',
        description: 'Watch streams for 24 hours total',
        icon: '📺',
        category: 'watching',
        rarity: 'rare',
        requirement: { type: 'watchTime', value: 86400000 },
        reward: { points: 500 }
    },
    {
        id: 'week_watcher',
        name: 'Stream Addict',
        description: 'Watch streams for 168 hours total',
        icon: '🎬',
        category: 'watching',
        rarity: 'epic',
        requirement: { type: 'watchTime', value: 604800000 },
        reward: { points: 2000 }
    },
    {
        id: 'first_follower',
        name: 'Social Butterfly',
        description: 'Follow your first user',
        icon: '🦋',
        category: 'social',
        rarity: 'common',
        requirement: { type: 'followers', value: 1 },
        reward: { points: 25 }
    },
    {
        id: 'popular',
        name: 'Popular',
        description: 'Get 10 followers',
        icon: '⭐',
        category: 'social',
        rarity: 'rare',
        requirement: { type: 'followers', value: 10 },
        reward: { points: 200 }
    },
    {
        id: 'influencer',
        name: 'Influencer',
        description: 'Get 100 followers',
        icon: '👑',
        category: 'social',
        rarity: 'epic',
        requirement: { type: 'followers', value: 100 },
        reward: { points: 1000 }
    },
    {
        id: 'chatterbox',
        name: 'Chatterbox',
        description: 'Send 100 messages',
        icon: '💬',
        category: 'engagement',
        rarity: 'common',
        requirement: { type: 'messages', value: 100 },
        reward: { points: 100 }
    },
    {
        id: 'clip_creator',
        name: 'Clip Master',
        description: 'Create 10 clips',
        icon: '✂️',
        category: 'engagement',
        rarity: 'rare',
        requirement: { type: 'clips', value: 10 },
        reward: { points: 300 }
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Login for 7 days in a row',
        icon: '🔥',
        category: 'engagement',
        rarity: 'rare',
        requirement: { type: 'streak', value: 7 },
        reward: { points: 250 }
    },
    {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Login for 30 days in a row',
        icon: '🏆',
        category: 'engagement',
        rarity: 'epic',
        requirement: { type: 'streak', value: 30 },
        reward: { points: 1500 }
    },
    {
        id: 'referrer',
        name: 'Recruiter',
        description: 'Refer 5 friends',
        icon: '🎁',
        category: 'social',
        rarity: 'epic',
        requirement: { type: 'referrals', value: 5 },
        reward: { points: 1000 }
    }
];

// Check and award achievements
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(session.user.id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;
        const currentAchievements = userData.achievements || [];
        const newAchievements = [];

        // Get user stats
        const stats = userData.stats || {};
        const followers = (userData.followers || []).length;
        const streak = userData.loginStreak?.current || 0;
        const referrals = (userData.referral?.referredUsers || []).length;

        // Check each achievement
        for (const achievement of ACHIEVEMENTS) {
            // Skip if already unlocked
            if (currentAchievements.some((a: any) => a.id === achievement.id)) {
                continue;
            }

            let qualified = false;

            switch (achievement.requirement.type) {
                case 'watchTime':
                    qualified = (stats.totalWatchTime || 0) >= achievement.requirement.value;
                    break;
                case 'followers':
                    qualified = followers >= achievement.requirement.value;
                    break;
                case 'messages':
                    qualified = (stats.messagesSent || 0) >= achievement.requirement.value;
                    break;
                case 'clips':
                    qualified = (stats.clipsCreated || 0) >= achievement.requirement.value;
                    break;
                case 'streak':
                    qualified = streak >= achievement.requirement.value;
                    break;
                case 'referrals':
                    qualified = referrals >= achievement.requirement.value;
                    break;
            }

            if (qualified) {
                newAchievements.push({
                    id: achievement.id,
                    unlockedAt: Date.now()
                });

                // Award points
                await userRef.update({
                    points: (userData.points || 0) + achievement.reward.points,
                    'stats.totalPointsEarned': (stats.totalPointsEarned || 0) + achievement.reward.points
                });

                // Create notification
                await adminDb.collection('notifications').add({
                    userId: session.user.id,
                    type: 'achievement',
                    title: 'Achievement Unlocked!',
                    message: `You unlocked "${achievement.name}"! +${achievement.reward.points} points`,
                    read: false,
                    createdAt: Date.now()
                });
            }
        }

        if (newAchievements.length > 0) {
            await userRef.update({
                achievements: [...currentAchievements, ...newAchievements]
            });
        }

        return NextResponse.json({
            newAchievements: newAchievements.map(a => {
                const def = ACHIEVEMENTS.find(ach => ach.id === a.id);
                return { ...a, ...def };
            })
        });
    } catch (error: any) {
        console.error('Achievement check error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get all achievements and user progress
export async function GET(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(session.user.id).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;
        const userAchievements = userData.achievements || [];

        const achievementsWithProgress = ACHIEVEMENTS.map(achievement => {
            const unlocked = userAchievements.find((a: any) => a.id === achievement.id);
            const stats = userData.stats || {};
            const followers = (userData.followers || []).length;
            const streak = userData.loginStreak?.current || 0;
            const referrals = (userData.referral?.referredUsers || []).length;

            let progress = 0;
            switch (achievement.requirement.type) {
                case 'watchTime':
                    progress = Math.min(100, ((stats.totalWatchTime || 0) / achievement.requirement.value) * 100);
                    break;
                case 'followers':
                    progress = Math.min(100, (followers / achievement.requirement.value) * 100);
                    break;
                case 'messages':
                    progress = Math.min(100, ((stats.messagesSent || 0) / achievement.requirement.value) * 100);
                    break;
                case 'clips':
                    progress = Math.min(100, ((stats.clipsCreated || 0) / achievement.requirement.value) * 100);
                    break;
                case 'streak':
                    progress = Math.min(100, (streak / achievement.requirement.value) * 100);
                    break;
                case 'referrals':
                    progress = Math.min(100, (referrals / achievement.requirement.value) * 100);
                    break;
            }

            return {
                ...achievement,
                unlocked: !!unlocked,
                unlockedAt: unlocked?.unlockedAt,
                progress: Math.round(progress)
            };
        });

        return NextResponse.json({ achievements: achievementsWithProgress });
    } catch (error: any) {
        console.error('Get achievements error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
