import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin';

// Add to watch history
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { streamerId, streamerName, duration, thumbnail } = await req.json();
        const adminDb = getAdminDb();

        await adminDb.collection('watchHistory').add({
            userId: session.user.id,
            streamerId,
            streamerName,
            duration,
            thumbnail,
            watchedAt: Date.now()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Add watch history error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get watch history
export async function GET(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const adminDb = getAdminDb();
        const historySnapshot = await adminDb.collection('watchHistory')
            .where('userId', '==', session.user.id)
            .orderBy('watchedAt', 'desc')
            .limit(limit)
            .get();

        const history = historySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ history });
    } catch (error: any) {
        console.error('Get watch history error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Clear watch history
export async function DELETE(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const adminDb = getAdminDb();
        const historySnapshot = await adminDb.collection('watchHistory')
            .where('userId', '==', session.user.id)
            .get();

        const batch = adminDb.batch();
        historySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return NextResponse.json({ success: true, deleted: historySnapshot.size });
    } catch (error: any) {
        console.error('Clear watch history error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
