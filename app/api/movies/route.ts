import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'home';

    const categoryUrls: Record<string, string> = {
        home: 'https://ww25.soap2day.day/soap2day-ctaj3/',
        trending: 'https://ww25.soap2day.day/trending-movies-14-soap2day-qwer1/',
        new2025: 'https://ww25.soap2day.day/genre/best-2025-6de5h/',
        popular: 'https://ww25.soap2day.day/top-100-popular-movies-soap2day-jjkk1/',
        boxoffice: 'https://ww25.soap2day.day/top-box-office-soap2day-2025/',
        top250: 'https://ww25.soap2day.day/top-250-imdb-movies/',
        tvshows: 'https://ww25.soap2day.day/series/',
        trendingTV: 'https://ww25.soap2day.day/trending-tv-14-days-soap2day-zxcv1/',
        top250tv: 'https://ww25.soap2day.day/top-250-imdb-tv-shows/',
        action: 'https://ww25.soap2day.day/genre/action/',
        comedy: 'https://ww25.soap2day.day/genre/comedy-movies/',
        horror: 'https://ww25.soap2day.day/genre/horror/',
        scifi: 'https://ww25.soap2day.day/genre/science-fiction-movies/',
        romance: 'https://ww25.soap2day.day/genre/romance-movies/',
        animation: 'https://ww25.soap2day.day/genre/animation-movies/',
        thriller: 'https://ww25.soap2day.day/genre/thriller/',
    };

    const url = categoryUrls[category] || categoryUrls.home;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();

        // Parse movie data from HTML
        const movies: any[] = [];

        // Match movie items - adjust regex based on actual HTML structure
        const moviePattern = /<div[^>]*class="[^"]*flw-item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
        const matches = html.matchAll(moviePattern);

        for (const match of matches) {
            const itemHtml = match[1];

            // Extract title
            const titleMatch = itemHtml.match(/title="([^"]+)"/i) || itemHtml.match(/alt="([^"]+)"/i);
            const title = titleMatch ? titleMatch[1] : 'Unknown';

            // Extract image
            const imgMatch = itemHtml.match(/data-src="([^"]+)"/i) || itemHtml.match(/src="([^"]+)"/i);
            const image = imgMatch ? imgMatch[1] : '';

            // Extract rating
            const ratingMatch = itemHtml.match(/class="[^"]*tick-rate[^"]*">([^<]+)</i);
            const rating = ratingMatch ? ratingMatch[1].trim() : 'N/A';

            // Extract link
            const linkMatch = itemHtml.match(/href="([^"]+)"/i);
            const link = linkMatch ? linkMatch[1] : '';

            // Extract year
            const yearMatch = itemHtml.match(/class="[^"]*fdi-item[^"]*">(\d{4})</i);
            const year = yearMatch ? yearMatch[1] : '';

            if (title && image) {
                movies.push({
                    title,
                    image,
                    rating,
                    link: link.startsWith('http') ? link : `https://ww25.soap2day.day${link}`,
                    year
                });
            }
        }

        return NextResponse.json({ movies, count: movies.length });
    } catch (error: any) {
        console.error('Movie scraper error:', error);
        return NextResponse.json({ error: error.message, movies: [] }, { status: 500 });
    }
}
