import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

// Daily login reward
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
        const now = Date.now();
        const lastLogin = userData.loginStreak?.lastLogin || 0;
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Check if already claimed today
        if (now - lastLogin < oneDayMs) {
            return NextResponse.json({
                error: 'Already claimed today',
                nextClaimAt: lastLogin + oneDayMs
            }, { status: 400 });
        }

        const currentStreak = userData.loginStreak?.current || 0;
        const longestStreak = userData.loginStreak?.longest || 0;

        // Check if streak continues (within 48 hours)
        const streakContinues = (now - lastLogin) < (2 * oneDayMs);
        const newStreak = streakContinues ? currentStreak + 1 : 1;
        const newLongest = Math.max(longestStreak, newStreak);

        // Calculate reward based on streak
        let reward = 10; // Base reward
        if (newStreak >= 7) reward = 50;
        if (newStreak >= 14) reward = 100;
        if (newStreak >= 30) reward = 250;
        if (newStreak >= 100) reward = 500;

        // Bonus for milestones
        const milestones = [7, 14, 30, 60, 100, 365];
        const isMilestone = milestones.includes(newStreak);
        if (isMilestone) {
            reward *= 2; // Double reward on milestones
        }

        // Update user
        await userRef.update({
            points: (userData.points || 0) + reward,
            'loginStreak.current': newStreak,
            'loginStreak.longest': newLongest,
            'loginStreak.lastLogin': now,
            'stats.totalPointsEarned': ((userData.stats?.totalPointsEarned || 0) + reward)
        });

        // Create notification for milestones
        if (isMilestone) {
            await adminDb.collection('notifications').add({
                userId: session.user.id,
                type: 'achievement',
                title: `${newStreak} Day Streak! 🔥`,
                message: `Amazing! You've logged in for ${newStreak} days in a row! Bonus reward: ${reward} points`,
                read: false,
                createdAt: now
            });
        }

        return NextResponse.json({
            reward,
            streak: newStreak,
            longestStreak: newLongest,
            isMilestone,
            nextReward: newStreak >= 100 ? 500 : (newStreak >= 30 ? 250 : (newStreak >= 14 ? 100 : (newStreak >= 7 ? 50 : 10)))
        });
    } catch (error: any) {
        console.error('Daily login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get login streak info
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
        const loginStreak = userData.loginStreak || { current: 0, longest: 0, lastLogin: 0 };
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        const canClaim = (now - loginStreak.lastLogin) >= oneDayMs;
        const nextClaimAt = loginStreak.lastLogin + oneDayMs;

        return NextResponse.json({
            ...loginStreak,
            canClaim,
            nextClaimAt
        });
    } catch (error: any) {
        console.error('Get login streak error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
