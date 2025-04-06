// Function to swap the From and To locations
function swapLocations() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const temp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = temp;
}

// Function to increment passenger count
function incrementCount(id) {
    const countElement = document.getElementById(id);
    let count = parseInt(countElement.textContent);
    countElement.textContent = count + 1;
}

// Function to decrement passenger count
function decrementCount(id) {
    const countElement = document.getElementById(id);
    let count = parseInt(countElement.textContent);
    if (count > 0) {
        countElement.textContent = count - 1;
    }
}

// Navigate to saved flights page when user profile is clicked
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
    } else {
        // Update username in the header
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = currentUser.username;
        }
    }

    // Add click event to user profile
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function () {
            window.location.href = 'saved-flights.html';
        });
    }

    // Handle flight search
    const searchButton = document.querySelector('.search-button'); // Search button in the form
    const loadingIndicator = document.getElementById('loading-indicator'); // Loading indicator element

    if (searchButton) {
        searchButton.addEventListener('click', async function () {
            // Collect user inputs from the form
            const origin = document.getElementById('from').value.trim(); // Origin location
            const destination = document.getElementById('to').value.trim(); // Destination location
            const departureDate = document.getElementById('departure').value; // Departure date
            const returnDate = document.getElementById('return').value; // Return date (optional)
            const adults = parseInt(document.getElementById('adult-count').textContent, 10); // Number of adults
            const children = parseInt(document.getElementById('children-count').textContent, 10) || 0; // Number of children
            const travelClass = document.getElementById('class').value.toUpperCase(); // Travel class

            // Validate inputs
            if (!origin || !destination || !departureDate || adults < 1) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Clear only previous search data, not the login info
            localStorage.removeItem('userChoices'); // Remove previous user choices
            localStorage.removeItem('flightOffers'); // Remove previous flight offers

            // Save user choices to localStorage
            const userChoices = {
                origin,
                destination,
                departureDate,
                returnDate,
                adults,
                children,
                travelClass
            };
            localStorage.setItem('userChoices', JSON.stringify(userChoices));
            // Show the loading indicator
            loadingIndicator.classList.add('visible');

            try {
                // Get the access token
                const accessToken = await getAccessToken();

                // Construct the request body dynamically based on user inputs
                const requestBody = {
                    currencyCode: "CAD", // Set currency to CAD
                    originDestinations: [
                        {
                            id: "1",
                            originLocationCode: origin,
                            destinationLocationCode: destination,
                            departureDateTimeRange: {
                                date: departureDate,
                                time: "10:00:00" // Default time
                            }
                        }
                    ],
                    travelers: [
                        { id: "1", travelerType: "ADULT" },
                        ...Array(children).fill().map((_, index) => ({
                            id: (index + 2).toString(),
                            travelerType: "CHILD"
                        }))
                    ],
                    sources: ["GDS"],
                    searchCriteria: {
                        maxFlightOffers: 50, // Increase the number of flight offers to display
                        flightFilters: {
                            cabinRestrictions: [
                                {
                                    cabin: travelClass,
                                    coverage: "MOST_SEGMENTS",
                                    originDestinationIds: ["1"]
                                }
                            ]
                        }
                    }
                };

                // Add return date if provided
                if (returnDate) {
                    requestBody.originDestinations.push({
                        id: "2",
                        originLocationCode: destination,
                        destinationLocationCode: origin,
                        departureDateTimeRange: {
                            date: returnDate,
                            time: "10:00:00" // Default time
                        }
                    });
                }

                // Make the API call
                const flightOffersUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";
                const response = await fetch(flightOffersUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "Accept": "application/vnd.amadeus+json"
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch flight offers: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Flight Offers:", data); // Log the response

                // Save flight offers to localStorage
                localStorage.setItem('flightOffers', JSON.stringify(data));

                // Redirect to the search page
                window.location.href = 'searchpage.html';
            } catch (error) {
                console.error("Error fetching flight offers:", error);
                alert('Failed to fetch flight offers. Please try again later.');
            } finally {
                // Hide the loading indicator
                loadingIndicator.classList.remove('visible');
            }
        });
    }
});

// Function to get the access token
async function getAccessToken() {
    const response = await fetch("/.netlify/functions/getAccessToken");
    const data = await response.json();
    return data.access_token; // Return the token for further API calls
}
