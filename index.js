function openMenu() {
    document.body.classList = "menu--open"
}

function closeMenu() {
    document.body.classList.remove('menu--open')
}

// store current fetched movies so we can sort without refetching
let currentMovies = [];

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
    movieResults.innerHTML = '';
    sortSelect.disabled = true;

    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=10e61220`);
        const data = await response.json();

        if (data.Response === 'True') {
            // fetch details for each result (limit to 8)
            const movies = await Promise.all(
                data.Search.slice(0, 8).map(async (movie) => {
                    const detailResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=10e61220`);
                    return await detailResponse.json();
                })
            );

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
        <div class="movie">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}" class="movie__img">
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
}