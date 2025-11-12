function openMenu() {
    document.body.classList = "menu--open"
}

function closeMenu() {
    document.body.classList.remove('menu--open')
}

// store current fetched movies so we can sort without refetching
let currentMovies = [];

// Local offline sample movies to display when the network/API is unreachable
const offlineSampleMovies = [
    {
        Title: 'Inception',
        Year: '2010',
        Poster: 'assets/no-poster.svg',
        Runtime: '148 min',
        Genre: 'Action, Adventure, Sci-Fi',
        Rated: 'PG-13',
        Plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        imdbRating: '8.8',
    },
    {
        Title: 'Interstellar',
        Year: '2014',
        Poster: 'assets/no-poster.svg',
        Runtime: '169 min',
        Genre: 'Adventure, Drama, Sci-Fi',
        Rated: 'PG-13',
        Plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
        imdbRating: '8.6',
    },
    {
        Title: 'The Dark Knight',
        Year: '2008',
        Poster: 'assets/no-poster.svg',
        Runtime: '152 min',
        Genre: 'Action, Crime, Drama',
        Rated: 'PG-13',
        Plot: 'When the menace known as the Joker emerges, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        imdbRating: '9.0',
    },
];

async function searchMovies() {
    const searchInput = document.getElementById('movieSearch');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const movieResults = document.getElementById('movieResults');
    const sortSelect = document.getElementById('sortSelect');
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a movie title to search');
        return;
    }

    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    movieResults.innerHTML = '<div class="no-results">Searching…</div>';
    sortSelect.disabled = true;
    // Move view to results section so users see updates
    const searchSection = document.getElementById('search');
    if (searchSection) {
        // Unhide results section on first search
        searchSection.classList.remove('hidden');
        searchSection.scrollIntoView({ behavior: 'smooth' });
    }

    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=10e61220`);
        const data = await response.json();

        if (data.Response === 'True') {
            // Try to enrich with details; gracefully fall back to base search data
            let movies = [];
            try {
                movies = await Promise.all(
                    data.Search.slice(0, 8).map(async (movie) => {
                        try {
                            const detailResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=10e61220`);
                            const details = await detailResponse.json();
                            return details;
                        } catch (e) {
                            // Fallback: use basic search info if detail fetch fails
                            return {
                                Title: movie.Title,
                                Year: movie.Year,
                                Poster: movie.Poster,
                                imdbID: movie.imdbID,
                                Type: movie.Type,
                                Runtime: undefined,
                                Genre: undefined,
                                Rated: undefined,
                                Plot: undefined,
                                imdbRating: undefined,
                            };
                        }
                    })
                );
            } catch (err) {
                movies = data.Search.slice(0, 8);
            }

            // save and render
            currentMovies = movies;
            renderMovies(currentMovies);
            sortSelect.disabled = false;
        } else {
            currentMovies = [];
            movieResults.innerHTML = '<div class="no-results">No movies found. Please try another search.</div>';
            sortSelect.disabled = true;
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        // Fallback to local offline sample data so users always see results
        currentMovies = offlineSampleMovies;
        renderMovies(currentMovies);
        sortSelect.disabled = false;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function renderMovies(movies) {
    const movieResults = document.getElementById('movieResults');
    if (!movies || movies.length === 0) {
        movieResults.innerHTML = '<div class="no-results">No movies found. Please try another search.</div>';
        return;
    }

    movieResults.innerHTML = movies.map(movie => `
        <div class="movie">
            <img src="${movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'assets/no-poster.svg'}" alt="${movie.Title}" class="movie__img">
            <div class="movie__title">${movie.Title} (${movie.Year})</div>
            <div class="movie__info">
                ${movie.Runtime || 'N/A'} | ${movie.Genre || 'N/A'} | ${movie.Rated || 'N/A'}
            </div>
            <div class="movie__plot">${movie.Plot || ''}</div>
            <div class="movie__ratings">
                <i class="fas fa-star"></i>
                <span>${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating + '/10' : 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function sortMovies(criteria) {
    if (!currentMovies || currentMovies.length === 0) return;
    let sorted = [...currentMovies];

    switch (criteria) {
        case 'best':
            sorted.sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
            break;
        case 'worst':
            sorted.sort((a, b) => (parseFloat(a.imdbRating) || 0) - (parseFloat(b.imdbRating) || 0));
            break;
        case 'newest':
            sorted.sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
            break;
        case 'oldest':
            sorted.sort((a, b) => (parseInt(a.Year) || 0) - (parseInt(b.Year) || 0));
            break;
        default:
            // no-op (original order)
            break;
    }

    renderMovies(sorted);
}

// Wire up sort select change
const sortEl = document.getElementById('sortSelect');
if (sortEl) {
    sortEl.addEventListener('change', (e) => {
        sortMovies(e.target.value);
    });
}

// Add event listener for Enter key
const searchEl = document.getElementById('movieSearch');
if (searchEl) {
    searchEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchMovies();
        }
    });
    // Add keydown for broader compatibility across browsers
    searchEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchMovies();
        }
    });
}

// Wire up search button explicitly to ensure click triggers search
const searchButtonEl = document.getElementById('searchButton');
if (searchButtonEl) {
    searchButtonEl.addEventListener('click', () => {
        searchMovies();
    });
}

// Expose handler globally in case inline handlers or other scripts reference it
window.searchMovies = searchMovies;

// Smooth fade-in on page load
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade', 'page-fade--in');
});