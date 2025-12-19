import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

// Get moderation queue (admin only)
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
        const isAdmin = userData.role === 'admin' || userData.username.toLowerCase() === 'reese';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'pending';

        const reportsSnapshot = await adminDb.collection('reports')
            .where('status', '==', status)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const reports = reportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ reports });
    } catch (error: any) {
        console.error('Get moderation queue error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Handle report (admin only)
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reportId, action, response } = await req.json();
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(session.user.id).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;
        const isAdmin = userData.role === 'admin' || userData.username.toLowerCase() === 'reese';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const reportRef = adminDb.collection('reports').doc(reportId);
        const reportDoc = await reportRef.get();

        if (!reportDoc.exists) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        if (action === 'approve') {
            await reportRef.update({
                status: 'approved',
                handledBy: session.user.id,
                handledAt: Date.now(),
                response
            });

            // Notify reporter
            const reportData = reportDoc.data()!;
            await adminDb.collection('notifications').add({
                userId: reportData.reporterId,
                type: 'moderation',
                title: 'Report Approved',
                message: `Your report has been reviewed and action has been taken.`,
                read: false,
                createdAt: Date.now()
            });

        } else if (action === 'reject') {
            await reportRef.update({
                status: 'rejected',
                handledBy: session.user.id,
                handledAt: Date.now(),
                response
            });

            // Notify reporter
            const reportData = reportDoc.data()!;
            await adminDb.collection('notifications').add({
                userId: reportData.reporterId,
                type: 'moderation',
                title: 'Report Reviewed',
                message: response || 'Your report has been reviewed.',
                read: false,
                createdAt: Date.now()
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Handle report error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
