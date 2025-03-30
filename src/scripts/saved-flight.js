document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }

    // Update user profile information
    updateUserProfile(currentUser);

    // Load saved flights for this user
    loadSavedFlights(currentUser.id);

    // Toggle favorite status
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    });

    // Details button functionality
    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', function () {
            alert('Flight details would be shown here in a modal or expanded section.');
        });
    });

    // Logout button functionality
    const logoutButton = document.getElementById('logout-button');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogoutButton = document.getElementById('confirm-logout');
    const cancelLogoutButton = document.getElementById('cancel-logout');
    const mainContentOverlay = document.getElementById('main-content-overlay');

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            // Show the logout confirmation modal
            logoutModal.style.display = 'flex';

            // Show the overlay on the main content
            mainContentOverlay.style.display = 'block';
        });
    }

    // Confirm logout functionality
    if (confirmLogoutButton) {
        confirmLogoutButton.addEventListener('click', function () {
            handleLogout();
        });
    }

    // Cancel logout functionality
    if (cancelLogoutButton) {
        cancelLogoutButton.addEventListener('click', function () {
            // Hide the logout confirmation modal
            logoutModal.style.display = 'none';

            // Hide the overlay on the main content
            mainContentOverlay.style.display = 'none';
        });
    }
});

// Update user profile information
function updateUserProfile(user) {
    const usernameElement = document.getElementById('profile-username');
    const emailElement = document.getElementById('profile-email');
    const phoneElement = document.getElementById('profile-phone');

    if (usernameElement) usernameElement.textContent = user.username;
    if (emailElement) emailElement.textContent = user.email;
    if (phoneElement) phoneElement.textContent = user.phone || 'N/A';
}

// Load saved flights for the current user
function loadSavedFlights(userId) {
    // Get saved flights from localStorage (or use empty array if none exist)
    const savedFlights = JSON.parse(localStorage.getItem(`savedFlights_${userId}`)) || [];
    
    // If there are no saved flights, you could display a message
    const flightsSection = document.querySelector('.flights-section');
    if (savedFlights.length === 0) {
        // Keep the existing flight cards as examples
        // In a real app, you might want to show a "No saved flights" message instead
    }
}

// Handle logout functionality
function handleLogout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    // Redirect to login page
    window.location.href = 'login.html';
}