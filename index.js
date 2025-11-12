// ==========================================
// HOME PAGE - index.js
// ==========================================
// This file handles navigation menu interactions and page fade transitions
// for the home page of PopcornFinder.
// ==========================================

/**
 * Opens the mobile navigation menu by adding the 'menu--open' class to body
 * This triggers the mobile menu overlay to appear
 */
function openMenu() {
    document.body.classList = "menu--open"
}

/**
 * Closes the mobile navigation menu by removing the 'menu--open' class from body
 * This hides the mobile menu overlay
 */
function closeMenu() {
    document.body.classList.remove('menu--open')
}

// ==========================================
// PAGE TRANSITIONS
// ==========================================

/**
 * Fade in the home page on load with smooth transition
 * Adds 'page-fade' and 'page-fade--in' classes to enable the CSS fade-in animation
 */
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade', 'page-fade--in');
});
