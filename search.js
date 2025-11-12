// Menu functions
function openMenu() {
    document.body.classList = "menu--open"
}

function closeMenu() {
    document.body.classList.remove('menu--open')
}

// Store current fetched movies for sorting
let currentMovies = [];

async function searchMovies() {
    const searchInput = document.getElementById('movieSearch');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const movieResults = document.getElementById('movieResults');
    const sortSelect = document.getElementById('sortSelect');
    const query = searchInput.value.trim();

    // If query is blank, perform a broad search
    const isBlank = !query;
    const defaultQuery = 'the';
    const maxPages = 3;

    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    movieResults.innerHTML = '';
    sortSelect.disabled = true;

    try {
        let searchResults = [];
        if (isBlank) {
            for (let page = 1; page <= maxPages; page++) {
                const resp = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(defaultQuery)}&page=${page}&apikey=10e61220`);
                const d = await resp.json();
                if (d.Response === 'True' && Array.isArray(d.Search)) {
                    searchResults = searchResults.concat(d.Search);
                } else {
                    break;
                }
            }
        } else {
            const resp = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=10e61220`);
            const d = await resp.json();
            if (d.Response === 'True' && Array.isArray(d.Search)) searchResults = d.Search;
        }

        if (searchResults.length === 0) {
            currentMovies = [];
            movieResults.innerHTML = '<div class="no-results">No movies found. Please try another search.</div>';
            sortSelect.disabled = true;
            return;
        }

        // Limit detail requests to avoid rate limits
        const maxDetails = 30;
        const uniqueIds = Array.from(new Set(searchResults.map(s => s.imdbID))).slice(0, maxDetails);

        const movies = await Promise.all(
            uniqueIds.map(async (id) => {
                const detailResponse = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=10e61220`);
                return await detailResponse.json();
            })
        );

        currentMovies = movies.filter(m => m && m.Response !== 'False');
        renderMovies(currentMovies);
        sortSelect.disabled = false;

    } catch (error) {
        console.error('Error searching movies:', error);
        currentMovies = [];
        movieResults.innerHTML = '<div class="no-results">An error occurred while searching. Please try again.</div>';
        sortSelect.disabled = true;
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
        <div class="movie" onclick="goToDetails('${movie.imdbID}')">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}" class="movie__img" loading="lazy">
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
            break;
    }

    renderMovies(sorted);
}

// Navigate to details page with movie ID
function goToDetails(imdbID) {
    // Store the movie ID in sessionStorage for the details page
    sessionStorage.setItem('selectedMovieId', imdbID);
    // Smooth fade-out before navigation
    document.body.classList.remove('page-fade--in');
    document.body.classList.add('page-fade');
    setTimeout(() => {
        window.location.href = 'details.html';
    }, 400);
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
}

// Fade in on page load
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade', 'page-fade--in');
});
