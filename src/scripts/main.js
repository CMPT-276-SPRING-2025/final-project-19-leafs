// API key and secret
const API_KEY = ''; // Replace with your actual API key
const API_SECRET = ''; // Replace with your actual API secret

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
});

// API Logic
document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.querySelector('.search-button');

    if (searchButton) {
        searchButton.addEventListener('click', async function () {
            // Collect user inputs
            const origin = document.getElementById('from').value;
            const destination = document.getElementById('to').value;
            const departureDate = document.getElementById('departure').value;
            const returnDate = document.getElementById('return').value;
            const adults = parseInt(document.getElementById('adult-count').textContent, 10);
            const children = parseInt(document.getElementById('children-count').textContent, 10);
            const travelClass = document.getElementById('class').value.toUpperCase(); // Convert to uppercase for API

            // Validate inputs
            if (!origin || !destination || !departureDate || !adults) {
                alert('Please fill in all required fields.');
                return;
            }

            // Construct query parameters for GET request
            const queryParams = new URLSearchParams({
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: departureDate,
                returnDate: returnDate || undefined, // Include only if returnDate is provided
                adults: adults,
                children: children || 0, // Default to 0 if not specified
                travelClass: travelClass || undefined, // Include only if travelClass is provided
                currencyCode: 'USD', // Default currency
                max: 10, // Limit the number of flight offers
            });

            // Construct request body for POST request
            const requestBody = {
                currencyCode: 'USD',
                originDestinations: [
                    {
                        id: '1',
                        originLocationCode: origin,
                        destinationLocationCode: destination,
                        departureDateTimeRange: {
                            date: departureDate,
                            time: '10:00:00',
                        },
                    },
                ],
                travelers: [
                    {
                        id: '1',
                        travelerType: 'ADULT',
                    },
                ],
                sources: ['GDS'],
                searchCriteria: {
                    maxFlightOffers: 5,
                    flightFilters: {
                        cabinRestrictions: [
                            {
                                cabin: travelClass,
                                coverage: 'MOST_SEGMENTS',
                                originDestinationIds: ['1'],
                            },
                        ],
                    },
                },
            };

            // API endpoints
            const getApiUrl = `https://api.example.com/shopping/flight-offers?${queryParams.toString()}`;
            const postApiUrl = `https://api.example.com/shopping/flight-offers`;

            try {
                // Make the GET request
                const getResponse = await fetch(getApiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`, // Include the API key
                    },
                });

                if (!getResponse.ok) {
                    throw new Error(`GET request failed with status: ${getResponse.status}`);
                }

                const getData = await getResponse.json();
                console.log('GET Flight Offers:', getData);

                // Make the POST request
                const postResponse = await fetch(postApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`, // Include the API key
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!postResponse.ok) {
                    throw new Error(`POST request failed with status: ${postResponse.status}`);
                }

                const postData = await postResponse.json();
                console.log('POST Flight Offers:', postData);

                // Store the data in localStorage (or log it to the console)
                localStorage.setItem('getFlightOffers', JSON.stringify(getData));
                localStorage.setItem('postFlightOffers', JSON.stringify(postData));

                // Optionally, redirect to a results page or display the data
                alert('Flight offers retrieved successfully! Check the console for details.');
            } catch (error) {
                console.error('Error fetching flight offers:', error);
                alert('Failed to fetch flight offers. Please try again later.');
            }
        });
    }
});

// You could add more functionality here, such as:
// - Form validation
// - Date picker functionality
// - Search functionality
// - Saving form data to localStorage