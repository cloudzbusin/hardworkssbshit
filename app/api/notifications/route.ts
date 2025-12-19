import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

// Get user notifications
export async function GET(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const adminDb = getAdminDb();
        let query = adminDb.collection('notifications')
            .where('userId', '==', session.user.id)
            .orderBy('createdAt', 'desc')
            .limit(limit);

        if (unreadOnly) {
            query = query.where('read', '==', false) as any;
        }

        const snapshot = await query.get();
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ notifications });
    } catch (error: any) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Mark notification as read
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { notificationId, markAllRead } = await req.json();
        const adminDb = getAdminDb();

        if (markAllRead) {
            // Mark all as read
            const snapshot = await adminDb.collection('notifications')
                .where('userId', '==', session.user.id)
                .where('read', '==', false)
                .get();

            const batch = adminDb.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            await batch.commit();

            return NextResponse.json({ success: true, count: snapshot.size });
        } else if (notificationId) {
            // Mark specific notification as read
            await adminDb.collection('notifications').doc(notificationId).update({
                read: true
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error: any) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete notification
export async function DELETE(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const notifDoc = await adminDb.collection('notifications').doc(notificationId).get();

        if (!notifDoc.exists) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        const notifData = notifDoc.data()!;
        if (notifData.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await adminDb.collection('notifications').doc(notificationId).delete();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
