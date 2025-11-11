// Menu functions
function openMenu() {
    document.body.classList = "menu--open"
}

function closeMenu() {
    document.body.classList.remove('menu--open')
}

// Fetch and display movie details
async function loadMovieDetails() {
    const movieId = sessionStorage.getItem('selectedMovieId');
    const detailsContent = document.getElementById('detailsContent');

    if (!movieId) {
        detailsContent.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=10e61220`);
        const movie = await response.json();

        if (movie.Response === 'False') {
            detailsContent.innerHTML = '';
            return;
        }

        // Display detailed movie information
        detailsContent.innerHTML = `
            <div class="movie-details">
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

                <div class="details-body">
                    <section class="detail-section">
                        <h2>Plot</h2>
                        <p>${movie.Plot || 'No plot information available.'}</p>
                    </section>

                    <section class="detail-section">
                        <h2>Credits</h2>
                        <p><strong>Director:</strong> ${movie.Director || 'N/A'}</p>
                        <p><strong>Writer:</strong> ${movie.Writer || 'N/A'}</p>
                        <p><strong>Cast:</strong> ${movie.Actors || 'N/A'}</p>
                    </section>

                    <section class="detail-section">
                        <h2>Production</h2>
                        <p><strong>Production:</strong> ${movie.Production || 'N/A'}</p>
                        <p><strong>Awards:</strong> ${movie.Awards || 'No awards information.'}</p>
                        <p><strong>Box Office:</strong> ${movie.BoxOffice || 'N/A'}</p>
                    </section>

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

// Load details when page loads
document.addEventListener('DOMContentLoaded', loadMovieDetails);
