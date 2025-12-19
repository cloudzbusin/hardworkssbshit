'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MoviesPage() {
    const [selectedCategory, setSelectedCategory] = useState('home');

    const categories = [
        { id: 'home', name: '🏠 Home', url: 'https://ww25.soap2day.day/soap2day-ctaj3/' },
        { id: 'trending', name: '🔥 Trending Movies', url: 'https://ww25.soap2day.day/trending-movies-14-soap2day-qwer1/' },
        { id: 'new2025', name: '🆕 Best 2025', url: 'https://ww25.soap2day.day/genre/best-2025-6de5h/' },
        { id: 'popular', name: '⭐ Top Popular', url: 'https://ww25.soap2day.day/top-100-popular-movies-soap2day-jjkk1/' },
        { id: 'boxoffice', name: '💰 Box Office', url: 'https://ww25.soap2day.day/top-box-office-soap2day-2025/' },
        { id: 'top250', name: '🏆 Top 250 Movies', url: 'https://ww25.soap2day.day/top-250-imdb-movies/' },
        { id: 'tvshows', name: '📺 TV Shows', url: 'https://ww25.soap2day.day/series/' },
        { id: 'trendingTV', name: '🔥 Trending TV', url: 'https://ww25.soap2day.day/trending-tv-14-days-soap2day-zxcv1/' },
        { id: 'top250tv', name: '🏆 Top 250 TV', url: 'https://ww25.soap2day.day/top-250-imdb-tv-shows/' },
        { id: 'action', name: '💥 Action', url: 'https://ww25.soap2day.day/genre/action/' },
        { id: 'comedy', name: '😂 Comedy', url: 'https://ww25.soap2day.day/genre/comedy-movies/' },
        { id: 'horror', name: '👻 Horror', url: 'https://ww25.soap2day.day/genre/horror/' },
        { id: 'scifi', name: '🚀 Sci-Fi', url: 'https://ww25.soap2day.day/genre/science-fiction-movies/' },
        { id: 'romance', name: '💕 Romance', url: 'https://ww25.soap2day.day/genre/romance-movies/' },
        { id: 'animation', name: '🎨 Animation', url: 'https://ww25.soap2day.day/genre/animation-movies/' },
        { id: 'thriller', name: '😱 Thriller', url: 'https://ww25.soap2day.day/genre/thriller/' },
    ];

    const currentUrl = categories.find(cat => cat.id === selectedCategory)?.url || categories[0].url;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #161616 50%, #0a0a0a 100%)',
            color: 'white'
        }}>
            <Header />

            <div style={{
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '100px 20px 40px'
            }}>
                {/* Page Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px',
                    padding: '30px',
                    background: 'linear-gradient(135deg, rgba(83, 252, 24, 0.05) 0%, rgba(83, 252, 24, 0.02) 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(83, 252, 24, 0.2)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #53FC18 0%, #45d013 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '15px',
                        textShadow: '0 0 30px rgba(83, 252, 24, 0.3)'
                    }}>
                        🎬 Movie Theater
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#888',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Stream thousands of movies and TV shows
                    </p>
                </div>

                {/* Category Navigation */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px',
                    padding: '20px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '15px',
                    border: '1px solid rgba(83, 252, 24, 0.1)'
                }}>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{
                                padding: '15px 20px',
                                borderRadius: '10px',
                                border: selectedCategory === category.id
                                    ? '2px solid #53FC18'
                                    : '1px solid rgba(83, 252, 24, 0.2)',
                                background: selectedCategory === category.id
                                    ? 'linear-gradient(135deg, #53FC18 0%, #45d013 100%)'
                                    : 'rgba(83, 252, 24, 0.05)',
                                color: selectedCategory === category.id ? '#000' : '#53FC18',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                                transition: 'all 0.3s ease',
                                boxShadow: selectedCategory === category.id
                                    ? '0 5px 20px rgba(83, 252, 24, 0.3)'
                                    : 'none',
                                transform: selectedCategory === category.id ? 'translateY(-2px)' : 'none'
                            }}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Embedded Content */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: 'calc(100vh - 400px)',
                    minHeight: '600px',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: '2px solid rgba(83, 252, 24, 0.2)',
                    boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
                    background: '#000'
                }}>
                    <iframe
                        src={currentUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        title="Movie Theater"
                        allowFullScreen
                    />
                </div>

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Link href="/">
                        <button style={{
                            padding: '15px 40px',
                            borderRadius: '10px',
                            border: '2px solid #53FC18',
                            background: 'rgba(83, 252, 24, 0.1)',
                            color: '#53FC18',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                            className="hover:brightness-125 hover:shadow-[0_0_20px_rgba(83,252,24,0.3)]"
                        >
                            ← Back to Homepage
                        </button>
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}
