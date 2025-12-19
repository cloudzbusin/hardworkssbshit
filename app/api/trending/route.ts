import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'streams'; // streams, clips, vods
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '20');

    try {
        const adminDb = getAdminDb();
        const adminRtdb = getAdminRtdb();
        const now = Date.now();

        let cutoffTime = now;
        if (period === 'daily') cutoffTime = now - (24 * 60 * 60 * 1000);
        else if (period === 'weekly') cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        else if (period === 'monthly') cutoffTime = now - (30 * 24 * 60 * 60 * 1000);

        if (type === 'streams') {
            // Get trending streams based on recent view time
            const statsSnapshot = await adminRtdb.ref('user_stats').get();
            const stats = statsSnapshot.val() || {};

            const streamerViews: Record<string, number> = {};

            Object.values(stats).forEach((userStats: any) => {
                if (userStats.lastActive > cutoffTime && userStats.watchHistory) {
                    Object.entries(userStats.watchHistory).forEach(([streamer, time]) => {
                        streamerViews[streamer] = (streamerViews[streamer] || 0) + (time as number);
                    });
                }
            });

            const trending = Object.entries(streamerViews)
                .map(([streamer, views]) => ({ streamer, views }))
                .sort((a, b) => b.views - a.views)
                .slice(0, limit);

            return NextResponse.json({ trending, type, period });

        } else if (type === 'clips') {
            // Get trending clips
            const clipsSnapshot = await adminDb.collection('clips')
                .where('createdAt', '>', cutoffTime)
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();

            const clips = clipsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                score: (doc.data().views || 0) + (doc.data().likes?.length || 0) * 2
            }));

            const trending = clips
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            return NextResponse.json({ trending, type, period });

        } else if (type === 'vods') {
            // Get trending VODs
            const vodsSnapshot = await adminDb.collection('vods')
                .where('recordedAt', '>', cutoffTime)
                .orderBy('recordedAt', 'desc')
                .limit(100)
                .get();

            const vods = vodsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                score: doc.data().views || 0
            }));

            const trending = vods
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            return NextResponse.json({ trending, type, period });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        console.error('Trending error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
