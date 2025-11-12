// ==========================================
// SEARCH PAGE - search.js
// ==========================================
// This file handles:
// - Movie search functionality using OMDB API
// - Search result rendering
// - Sorting results by rating or year
// - Navigation to movie details page
// - Mobile menu interactions
// - Page transition effects
// ==========================================

// ==========================================
// NAVIGATION & MENU
// ==========================================

/**
 * Opens the mobile navigation menu
 */
function openMenu() {
    document.body.classList = "menu--open"
}

/**
 * Closes the mobile navigation menu
 */
function closeMenu() {
    document.body.classList.remove('menu--open')
}

// ==========================================
// STATE MANAGEMENT
// ==========================================

/**
 * Global array to store current search results (with full movie details)
 * Used for sorting without needing to re-fetch from the API
 */
let currentMovies = [];

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

/**
 * Searches for movies using the OMDB API
 * - Fetches basic search results
 * - Fetches detailed information for each result
 * - Handles blank searches with broad query
 * - Manages loading state and error handling
 */
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
        
        // Fetch search results (multiple pages if blank query, single page otherwise)
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

        // Handle no results
        if (searchResults.length === 0) {
            currentMovies = [];
            movieResults.innerHTML = '<div class="no-results">No movies found. Please try another search.</div>';
            sortSelect.disabled = true;
            return;
        }

        // Fetch detailed information for each movie (limited to avoid API rate limits)
        const maxDetails = 30;
        const uniqueIds = Array.from(new Set(searchResults.map(s => s.imdbID))).slice(0, maxDetails);

        const movies = await Promise.all(
            uniqueIds.map(async (id) => {
                const detailResponse = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=10e61220`);
                return await detailResponse.json();
            })
        );

        // Store movies and render results
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

// ==========================================
// RENDERING
// ==========================================

/**
 * Renders an array of movie objects as movie cards in the DOM
 * Each card displays poster, title, runtime, genre, plot, and rating
 * Cards are clickable to navigate to movie details
 * 
 * @param {Array} movies - Array of movie objects from OMDB API
 */
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

// ==========================================
// SORTING
// ==========================================

/**
 * Sorts the current movies array by the specified criteria
 * Re-renders the results after sorting
 * 
 * @param {string} criteria - Sort option: 'best', 'worst', 'newest', or 'oldest'
 */
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

// ==========================================
// NAVIGATION
// ==========================================

/**
 * Navigates to the movie details page for a specific movie
 * Stores the movie ID in sessionStorage for the details page to retrieve
 * Triggers smooth page fade-out before navigation
 * 
 * @param {string} imdbID - The IMDB ID of the movie to view details for
 */
function goToDetails(imdbID) {
    sessionStorage.setItem('selectedMovieId', imdbID);
    // Smooth fade-out before navigation
    document.body.classList.remove('page-fade--in');
    document.body.classList.add('page-fade');
    setTimeout(() => {
        window.location.href = 'details.html';
    }, 400);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Sort select dropdown - trigger sort on change
const sortEl = document.getElementById('sortSelect');
if (sortEl) {
    sortEl.addEventListener('change', (e) => {
        sortMovies(e.target.value);
    });
}

// Search input - trigger search on Enter key
const searchEl = document.getElementById('movieSearch');
if (searchEl) {
    searchEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchMovies();
        }
    });
}

// ==========================================
// PAGE TRANSITIONS
// ==========================================

/**
 * Fade in the page on load with smooth transition
 */
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade', 'page-fade--in');
});
