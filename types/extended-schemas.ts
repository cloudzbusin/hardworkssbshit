// Extended User Profile Schema for Firestore
export interface ExtendedUserProfile {
    // Basic Info
    uid: string;
    username: string;
    email: string;
    createdAt: number;

    // Profile Customization (Feature 13)
    bio?: string;
    banner?: string;
    profilePic?: string;
    socialLinks?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
        twitch?: string;
    };
    favoriteStreamers?: string[];

    // Privacy Settings (Feature 33)
    privacy: {
        profileVisibility: 'public' | 'private' | 'friends';
        showWatchHistory: boolean;
        showFollowing: boolean;
        showFollowers: boolean;
        showAchievements: boolean;
        anonymousMode: boolean;
    };

    // Parental Controls (Feature 34)
    parentalControls?: {
        enabled: boolean;
        contentFilter: 'none' | 'moderate' | 'strict';
        timeLimit?: number; // minutes per day
        allowedCategories?: string[];
    };

    // Follow System (Feature 11)
    following: string[]; // user IDs
    followers: string[]; // user IDs
    followingStreamers: string[]; // streamer slugs

    // Friends System (Feature 12)
    friends: string[]; // user IDs
    friendRequests: {
        sent: string[];
        received: string[];
    };

    // Achievements (Feature 3)
    achievements: {
        id: string;
        unlockedAt: number;
    }[];

    // Daily Login (Feature 29)
    loginStreak: {
        current: number;
        longest: number;
        lastLogin: number;
    };

    // Referral System (Feature 30)
    referral: {
        code: string;
        referredBy?: string;
        referredUsers: string[];
        totalRewards: number;
    };

    // Premium Membership (Feature 6)
    premium: {
        tier: 'free' | 'basic' | 'pro' | 'elite';
        expiresAt?: number;
        features: string[];
    };

    // Customization (Feature 16, 17)
    preferences: {
        theme: 'dark' | 'light' | 'custom';
        accentColor?: string;
        chatFontSize: 'small' | 'medium' | 'large';
        chatMode: 'compact' | 'cozy' | 'spacious';
        homepageLayout?: {
            widgets: string[];
            pinnedStreamers: string[];
        };
    };

    // Notifications (Feature 21)
    notifications: {
        browser: boolean;
        email: boolean;
        discord?: string; // webhook URL
        preferences: {
            streamersLive: boolean;
            friendsOnline: boolean;
            achievements: boolean;
            messages: boolean;
        };
    };

    // Stats
    stats: {
        totalWatchTime: number;
        totalPoints: number;
        totalPointsEarned: number;
        totalPointsSpent: number;
        clipsCreated: number;
        messagessent: number;
    };

    // Existing fields
    points: number;
    color?: string;
    badge?: string;
    verified?: boolean;
    role?: 'admin' | 'user' | 'moderator';
    banned?: {
        until: number;
        reason: string;
    };
}

// Achievement Schema
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'watching' | 'social' | 'engagement' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    requirement: {
        type: 'watchTime' | 'followers' | 'messages' | 'clips' | 'streak' | 'referrals';
        value: number;
    };
    reward: {
        points: number;
        badge?: string;
    };
}

// Clip Schema (Feature 7)
export interface Clip {
    id: string;
    creatorId: string;
    creatorUsername: string;
    streamerId: string;
    streamerName: string;
    title: string;
    url: string;
    thumbnail: string;
    duration: number;
    views: number;
    likes: string[]; // user IDs
    createdAt: number;
    tags: string[];
}

// VOD Schema (Feature 8)
export interface VOD {
    id: string;
    streamerId: string;
    streamerName: string;
    title: string;
    url: string;
    thumbnail: string;
    duration: number;
    game?: string;
    category?: string;
    views: number;
    recordedAt: number;
    bookmarks: {
        userId: string;
        timestamp: number;
        note?: string;
    }[];
}

// Podcast Schema (Feature 9)
export interface Podcast {
    id: string;
    title: string;
    description: string;
    coverArt: string;
    author: string;
    episodes: PodcastEpisode[];
    category: string;
    subscribers: string[];
}

export interface PodcastEpisode {
    id: string;
    podcastId: string;
    title: string;
    description: string;
    audioUrl: string;
    duration: number;
    publishedAt: number;
    playCount: number;
}

// Forum Schema (Feature 14)
export interface ForumPost {
    id: string;
    authorId: string;
    authorUsername: string;
    category: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    views: number;
    likes: string[];
    replies: ForumReply[];
    pinned: boolean;
    locked: boolean;
}

export interface ForumReply {
    id: string;
    authorId: string;
    authorUsername: string;
    content: string;
    createdAt: number;
    likes: string[];
}

// Watch Party Schema (Feature 12)
export interface WatchParty {
    id: string;
    hostId: string;
    hostUsername: string;
    streamUrl: string;
    participants: string[];
    maxParticipants: number;
    isPrivate: boolean;
    createdAt: number;
    status: 'active' | 'ended';
}

// Notification Schema (Feature 21)
export interface Notification {
    id: string;
    userId: string;
    type: 'streamer_live' | 'friend_online' | 'achievement' | 'message' | 'friend_request';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: number;
}
