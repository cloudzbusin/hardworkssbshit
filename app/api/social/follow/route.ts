import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin';

// Follow a user or streamer
export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { targetId, type } = await req.json(); // type: 'user' or 'streamer'
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(session.user.id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;

        if (type === 'user') {
            const following = userData.following || [];
            const isFollowing = following.includes(targetId);

            if (isFollowing) {
                // Unfollow
                await userRef.update({
                    following: following.filter((id: string) => id !== targetId)
                });

                // Remove from target's followers
                const targetRef = adminDb.collection('users').doc(targetId);
                const targetDoc = await targetRef.get();
                if (targetDoc.exists) {
                    const targetData = targetDoc.data()!;
                    const followers = targetData.followers || [];
                    await targetRef.update({
                        followers: followers.filter((id: string) => id !== session.user.id)
                    });
                }

                return NextResponse.json({ following: false });
            } else {
                // Follow
                await userRef.update({
                    following: [...following, targetId]
                });

                // Add to target's followers
                const targetRef = adminDb.collection('users').doc(targetId);
                const targetDoc = await targetRef.get();
                if (targetDoc.exists) {
                    const targetData = targetDoc.data()!;
                    const followers = targetData.followers || [];
                    await targetRef.update({
                        followers: [...followers, session.user.id]
                    });
                }

                // Create notification for target user
                await adminDb.collection('notifications').add({
                    userId: targetId,
                    type: 'new_follower',
                    title: 'New Follower',
                    message: `${userData.username} started following you!`,
                    link: `/user/${userData.username}`,
                    read: false,
                    createdAt: Date.now()
                });

                return NextResponse.json({ following: true });
            }
        } else if (type === 'streamer') {
            const followingStreamers = userData.followingStreamers || [];
            const isFollowing = followingStreamers.includes(targetId);

            if (isFollowing) {
                await userRef.update({
                    followingStreamers: followingStreamers.filter((id: string) => id !== targetId)
                });
                return NextResponse.json({ following: false });
            } else {
                await userRef.update({
                    followingStreamers: [...followingStreamers, targetId]
                });
                return NextResponse.json({ following: true });
            }
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        console.error('Follow error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get following/followers list
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'following' or 'followers' or 'streamers'

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;

        if (type === 'following') {
            const following = userData.following || [];
            const followingData = await Promise.all(
                following.map(async (id: string) => {
                    const doc = await adminDb.collection('users').doc(id).get();
                    if (doc.exists) {
                        const data = doc.data()!;
                        return {
                            id: doc.id,
                            username: data.username,
                            profilePic: data.profilePic,
                            verified: data.verified
                        };
                    }
                    return null;
                })
            );
            return NextResponse.json({ users: followingData.filter(Boolean) });
        } else if (type === 'followers') {
            const followers = userData.followers || [];
            const followersData = await Promise.all(
                followers.map(async (id: string) => {
                    const doc = await adminDb.collection('users').doc(id).get();
                    if (doc.exists) {
                        const data = doc.data()!;
                        return {
                            id: doc.id,
                            username: data.username,
                            profilePic: data.profilePic,
                            verified: data.verified
                        };
                    }
                    return null;
                })
            );
            return NextResponse.json({ users: followersData.filter(Boolean) });
        } else if (type === 'streamers') {
            const streamers = userData.followingStreamers || [];
            return NextResponse.json({ streamers });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        console.error('Get follow data error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
