// ==========================================
// DETAILS PAGE - details.js
// ==========================================
// This file handles:
// - Loading movie details from OMDB API
// - Rendering detailed movie information
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
// DETAILS LOADING & RENDERING
// ==========================================

/**
 * Fetches and displays detailed information for a selected movie
 * - Retrieves the movie ID from sessionStorage (set by search.js)
 * - Fetches detailed movie data from OMDB API
 * - Renders poster, title, meta information, plot, cast, production, and ratings
 * - Handles errors gracefully
 */
async function loadMovieDetails() {
    const movieId = sessionStorage.getItem('selectedMovieId');
    const detailsContent = document.getElementById('detailsContent');

    // If no movie ID is set, render empty (no error message needed)
    if (!movieId) {
        detailsContent.innerHTML = '';
        return;
    }

    try {
        // Fetch movie details from OMDB API
        const response = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=10e61220`);
        const movie = await response.json();

        // Handle API error response
        if (movie.Response === 'False') {
            detailsContent.innerHTML = '';
            return;
        }

        // Render movie details HTML
        detailsContent.innerHTML = `
            <div class="movie-details">
                <!-- Movie Header with Poster and Meta Info -->
                <div class="details-header">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}" class="details-poster" loading="lazy">
                    <div class="details-info">
                        <h1>${movie.Title}</h1>
                        <div class="details-meta">
                            <span class="meta-item"><strong>Year:</strong> ${movie.Year}</span>
                            <span class="meta-item"><strong>Rated:</strong> ${movie.Rated || 'N/A'}</span>
                            <span class="meta-item"><strong>Runtime:</strong> ${movie.Runtime || 'N/A'}</span>
                            <span class="meta-item"><strong>Genre:</strong> ${movie.Genre || 'N/A'}</span>
                        </div>
                        <div class="details-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating + '/10' : 'N/A'}</span>
                            <span class="rating-votes">${movie.imdbVotes ? '(' + movie.imdbVotes + ' votes)' : ''}</span>
                        </div>
                    </div>
                </div>

                <!-- Movie Body: Plot, Credits, Production, Ratings -->
                <div class="details-body">
                    <!-- Plot Section -->
                    <section class="detail-section">
                        <h2>Plot</h2>
                        <p>${movie.Plot || 'No plot information available.'}</p>
                    </section>

                    <!-- Credits Section -->
                    <section class="detail-section">
                        <h2>Credits</h2>
                        <p><strong>Director:</strong> ${movie.Director || 'N/A'}</p>
                        <p><strong>Writer:</strong> ${movie.Writer || 'N/A'}</p>
                        <p><strong>Cast:</strong> ${movie.Actors || 'N/A'}</p>
                    </section>

                    <!-- Production Section -->
                    <section class="detail-section">
                        <h2>Production</h2>
                        <p><strong>Production:</strong> ${movie.Production || 'N/A'}</p>
                        <p><strong>Awards:</strong> ${movie.Awards || 'No awards information.'}</p>
                        <p><strong>Box Office:</strong> ${movie.BoxOffice || 'N/A'}</p>
                    </section>

                    <!-- Ratings Section (if available) -->
                    ${movie.Ratings && movie.Ratings.length > 0 ? `
                    <section class="detail-section">
                        <h2>Ratings</h2>
                        <div class="ratings-list">
                            ${movie.Ratings.map(r => `<p><strong>${r.Source}:</strong> ${r.Value}</p>`).join('')}
                        </div>
                    </section>
                    ` : ''}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error fetching movie details:', error);
        detailsContent.innerHTML = '';
    }
}

// ==========================================
// PAGE INITIALIZATION & TRANSITIONS
// ==========================================

/**
 * Initialize page on load:
 * - Fade in with smooth transition
 * - Load movie details from OMDB
 */
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade', 'page-fade--in');
    loadMovieDetails();
});
