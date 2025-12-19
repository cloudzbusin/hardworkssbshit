import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'watchTime'; // watchTime, points, followers, messages
    const period = searchParams.get('period') || 'allTime'; // daily, weekly, monthly, allTime
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const adminDb = getAdminDb();
        const adminRtdb = getAdminRtdb();

        let leaderboard: any[] = [];

        if (type === 'watchTime') {
            // Get watch time from RTDB
            const statsSnapshot = await adminRtdb.ref('user_stats').get();
            const stats = statsSnapshot.val() || {};

            const watchTimeData = Object.entries(stats).map(([userId, data]: [string, any]) => ({
                userId,
                value: data.totalTimeMs || 0,
                lastActive: data.lastActive
            }));

            // Filter by period
            const now = Date.now();
            let filteredData = watchTimeData;

            if (period === 'daily') {
                filteredData = watchTimeData.filter(d => now - d.lastActive < 24 * 60 * 60 * 1000);
            } else if (period === 'weekly') {
                filteredData = watchTimeData.filter(d => now - d.lastActive < 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'monthly') {
                filteredData = watchTimeData.filter(d => now - d.lastActive < 30 * 24 * 60 * 60 * 1000);
            }

            leaderboard = filteredData
                .sort((a, b) => b.value - a.value)
                .slice(0, limit);

        } else if (type === 'points') {
            const usersSnapshot = await adminDb.collection('users')
                .orderBy('points', 'desc')
                .limit(limit)
                .get();

            leaderboard = usersSnapshot.docs.map(doc => ({
                userId: doc.id,
                value: doc.data().points || 0
            }));

        } else if (type === 'followers') {
            const usersSnapshot = await adminDb.collection('users').get();

            leaderboard = usersSnapshot.docs
                .map(doc => ({
                    userId: doc.id,
                    value: (doc.data().followers || []).length
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, limit);

        } else if (type === 'messages') {
            const usersSnapshot = await adminDb.collection('users').get();

            leaderboard = usersSnapshot.docs
                .map(doc => ({
                    userId: doc.id,
                    value: doc.data().stats?.messagesSent || 0
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, limit);
        }

        // Fetch user details
        const enrichedLeaderboard = await Promise.all(
            leaderboard.map(async (entry, index) => {
                const userDoc = await adminDb.collection('users').doc(entry.userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data()!;
                    return {
                        rank: index + 1,
                        userId: entry.userId,
                        username: userData.username,
                        profilePic: userData.profilePic,
                        verified: userData.verified,
                        value: entry.value,
                        badge: userData.badge
                    };
                }
                return null;
            })
        );

        return NextResponse.json({
            leaderboard: enrichedLeaderboard.filter(Boolean),
            type,
            period
        });
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
