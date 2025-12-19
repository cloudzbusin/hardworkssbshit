import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create or get referral code
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
        let referralData = userData.referral;

        // Create referral code if doesn't exist
        if (!referralData || !referralData.code) {
            const code = generateReferralCode();
            referralData = {
                code,
                referredUsers: [],
                totalRewards: 0
            };

            await adminDb.collection('users').doc(session.user.id).update({
                referral: referralData
            });
        }

        return NextResponse.json(referralData);
    } catch (error: any) {
        console.error('Get referral error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Apply referral code (for new users)
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { code } = await req.json();
        const adminDb = getAdminDb();

        // Find user with this referral code
        const usersSnapshot = await adminDb.collection('users')
            .where('referral.code', '==', code)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        const referrerDoc = usersSnapshot.docs[0];
        const referrerId = referrerDoc.id;

        // Can't refer yourself
        if (referrerId === session.user.id) {
            return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
        }

        // Check if user already used a referral code
        const currentUserDoc = await adminDb.collection('users').doc(session.user.id).get();
        const currentUserData = currentUserDoc.data()!;

        if (currentUserData.referral?.referredBy) {
            return NextResponse.json({ error: 'Already used a referral code' }, { status: 400 });
        }

        // Apply referral
        const referrerData = referrerDoc.data()!;
        const referredUsers = referrerData.referral?.referredUsers || [];
        const totalRewards = referrerData.referral?.totalRewards || 0;

        // Rewards
        const referrerReward = 100; // Points for referrer
        const refereeReward = 50; // Points for new user

        // Update referrer
        await adminDb.collection('users').doc(referrerId).update({
            points: (referrerData.points || 0) + referrerReward,
            'referral.referredUsers': [...referredUsers, session.user.id],
            'referral.totalRewards': totalRewards + referrerReward,
            'stats.totalPointsEarned': ((referrerData.stats?.totalPointsEarned || 0) + referrerReward)
        });

        // Update new user
        await adminDb.collection('users').doc(session.user.id).update({
            points: (currentUserData.points || 0) + refereeReward,
            'referral.referredBy': referrerId,
            'stats.totalPointsEarned': ((currentUserData.stats?.totalPointsEarned || 0) + refereeReward)
        });

        // Notify referrer
        await adminDb.collection('notifications').add({
            userId: referrerId,
            type: 'referral',
            title: 'New Referral! 🎁',
            message: `${currentUserData.username} joined using your referral code! You earned ${referrerReward} points!`,
            read: false,
            createdAt: Date.now()
        });

        return NextResponse.json({
            success: true,
            reward: refereeReward,
            referrerUsername: referrerData.username
        });
    } catch (error: any) {
        console.error('Apply referral error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
