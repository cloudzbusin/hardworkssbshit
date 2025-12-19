'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Movie {
    title: string;
    image: string;
    rating: string;
    link: string;
    year?: string;
}

export default function MoviesPage() {
    const [selectedCategory, setSelectedCategory] = useState('home');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: 'home', name: '🏠 Home' },
        { id: 'trending', name: '🔥 Trending Movies' },
        { id: 'new2025', name: '🆕 Best 2025' },
        { id: 'popular', name: '⭐ Top Popular' },
        { id: 'boxoffice', name: '💰 Box Office' },
        { id: 'top250', name: '🏆 Top 250 Movies' },
        { id: 'tvshows', name: '📺 TV Shows' },
        { id: 'trendingTV', name: '🔥 Trending TV' },
        { id: 'top250tv', name: '🏆 Top 250 TV' },
        { id: 'action', name: '💥 Action' },
        { id: 'comedy', name: '😂 Comedy' },
        { id: 'horror', name: '👻 Horror' },
        { id: 'scifi', name: '🚀 Sci-Fi' },
        { id: 'romance', name: '💕 Romance' },
        { id: 'animation', name: '🎨 Animation' },
        { id: 'thriller', name: '😱 Thriller' },
    ];

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/movies?category=${selectedCategory}`);
                const data = await res.json();
                setMovies(data.movies || []);
            } catch (error) {
                console.error('Failed to fetch movies:', error);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [selectedCategory]);

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
                    marginBottom: '40px',
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

                {/* Movie Grid */}
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '100px 20px',
                        color: '#53FC18',
                        fontSize: '1.5rem'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            width: '50px',
                            height: '50px',
                            border: '4px solid rgba(83, 252, 24, 0.2)',
                            borderTop: '4px solid #53FC18',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ marginTop: '20px' }}>Loading movies...</p>
                    </div>
                ) : movies.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '25px',
                        padding: '20px 0'
                    }}>
                        {movies.map((movie, index) => (
                            <a
                                key={index}
                                href={movie.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    textDecoration: 'none',
                                    color: 'white',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(83, 252, 24, 0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                className="movie-card"
                            >
                                <div style={{
                                    position: 'relative',
                                    paddingBottom: '150%',
                                    background: '#000',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={movie.image}
                                        alt={movie.title}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {movie.rating && movie.rating !== 'N/A' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0, 0, 0, 0.8)',
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            color: '#53FC18',
                                            border: '1px solid rgba(83, 252, 24, 0.3)'
                                        }}>
                                            ⭐ {movie.rating}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    padding: '15px'
                                }}>
                                    <h3 style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 'bold',
                                        margin: '0 0 5px 0',
                                        color: '#fff',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        minHeight: '2.8em'
                                    }}>
                                        {movie.title}
                                    </h3>
                                    {movie.year && (
                                        <p style={{
                                            fontSize: '0.8rem',
                                            color: '#888',
                                            margin: 0
                                        }}>
                                            {movie.year}
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '100px 20px',
                        color: '#888',
                        fontSize: '1.2rem'
                    }}>
                        No movies found for this category.
                    </div>
                )}

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
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

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .movie-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(83, 252, 24, 0.4);
                    box-shadow: 0 10px 30px rgba(83, 252, 24, 0.2);
                }
            `}</style>
        </div>
    );
}
