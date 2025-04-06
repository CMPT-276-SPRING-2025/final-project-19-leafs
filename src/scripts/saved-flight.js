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

    // Retrieve saved flights from localStorage
    const savedFlights = JSON.parse(localStorage.getItem('savedFlights')) || [];

    // Get the container where saved flights will be displayed
    const flightsSection = document.querySelector('.flights-section');

    if (savedFlights.length === 0) {
        flightsSection.innerHTML = '<h2 class="section-title">Your Saved Flights</h2><p>No saved flights found.</p>';
        return;
    }

    // Render each saved flight
    savedFlights.forEach(flight => {
        const flightCard = document.createElement('div');
        flightCard.classList.add('flight-card');

        // Extract flight details
        const itinerary = flight.itineraries[0];
        const segments = itinerary.segments;
        const departure = segments[0].departure;
        const arrival = segments[segments.length - 1].arrival;

        flightCard.innerHTML = `
            <div class="flight-details">
                <!-- Outbound Flight -->
                <div class="flight-leg">
                    <div class="airline">
                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/WestJet_Logo_2018.svg/250px-WestJet_Logo_2018.svg.png" alt="Airline Logo" class="airline-logo">
                    </div>
                    <div class="departure">
                        <div class="time">${new Date(departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        <div class="city">${departure.iataCode}</div>
                    </div>
                    <div class="flight-path">
                        <div class="duration">Flight Hours: ${itinerary.duration.replace('PT', '').toLowerCase()}</div>
                        <div class="path-line"></div>
                        <div class="flight-type">Direct</div>
                    </div>
                    <div class="arrival">
                        <div class="time">${new Date(arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        <div class="city">${arrival.iataCode}</div>
                    </div>
                </div>
                <!-- Flight Actions -->
                <div class="flight-actions">
                    <button class="details-button" data-id="${flight.id}">
                        <i class="fa-solid fa-circle-info"></i>
                        Details
                    </button>
                    <button class="favorite-button liked" data-id="${flight.id}">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="flight-price">
                <div class="price-tag">
                    <div class="price-value">C$${flight.price.total}</div>
                </div>
            </div>
        `;

        flightsSection.appendChild(flightCard);
    });

    // Add event listeners to all "Details" buttons
    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', function () {
            const flightId = button.getAttribute('data-id');
            const selectedFlight = savedFlights.find(flight => flight.id === flightId);

            if (selectedFlight) {
                // Save the selected flight to localStorage
                localStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));

                // Redirect to the detail page
                window.location.href = 'detailpage.html';
            }
        });
    });
    
    // Add event listeners to all favorite buttons
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', function () {
            const flightId = button.getAttribute('data-id');

            // Remove flight from saved flights
            const updatedFlights = savedFlights.filter(flight => flight.id !== flightId);

            // Update localStorage
            localStorage.setItem('savedFlights', JSON.stringify(updatedFlights));

            // Reload the page to reflect changes
            window.location.reload();
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