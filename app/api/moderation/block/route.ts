import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

// Block a user
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { action, targetUserId, reason } = await req.json();
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(session.user.id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;
        const blockedUsers = userData.blockedUsers || [];

        if (action === 'block') {
            if (blockedUsers.includes(targetUserId)) {
                return NextResponse.json({ error: 'User already blocked' }, { status: 400 });
            }

            await userRef.update({
                blockedUsers: [...blockedUsers, targetUserId]
            });

            return NextResponse.json({ success: true, blocked: true });
        } else if (action === 'unblock') {
            await userRef.update({
                blockedUsers: blockedUsers.filter((id: string) => id !== targetUserId)
            });

            return NextResponse.json({ success: true, blocked: false });
        } else if (action === 'report') {
            // Create report
            await adminDb.collection('reports').add({
                reporterId: session.user.id,
                reporterUsername: userData.username,
                targetUserId,
                reason,
                type: 'user',
                status: 'pending',
                createdAt: Date.now()
            });

            return NextResponse.json({ success: true, reported: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Moderation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get blocked users
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
        const blockedUsers = userData.blockedUsers || [];

        // Fetch blocked user details
        const blockedUserDetails = await Promise.all(
            blockedUsers.map(async (userId: string) => {
                const doc = await adminDb.collection('users').doc(userId).get();
                if (doc.exists) {
                    const data = doc.data()!;
                    return {
                        id: doc.id,
                        username: data.username,
                        profilePic: data.profilePic
                    };
                }
                return null;
            })
        );

        return NextResponse.json({ blockedUsers: blockedUserDetails.filter(Boolean) });
    } catch (error: any) {
        console.error('Get blocked users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
