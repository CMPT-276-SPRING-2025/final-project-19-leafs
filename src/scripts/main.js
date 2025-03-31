import config from '../../config.js';

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

async function getAccessToken() {
    const AMADEUS_API_KEY = config.AMADEUS_API_KEY; // Replace with your API Key
    const AMADEUS_API_SECRET = config.AMADEUS_API_SECRET; // Replace with your API Secret
    const authUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";

    const response = await fetch(authUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: AMADEUS_API_KEY,
            client_secret: AMADEUS_API_SECRET
        })
    });

    const data = await response.json();
    return data.access_token; // Return the token for further API calls
}

async function getFlightOffers() {
    const accessToken = await getAccessToken(); // Get token first
    const flightOffersUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";

    const requestBody = {
        currencyCode: "USD",
        originDestinations: [
            {
                id: "1",
                originLocationCode: "NYC",
                destinationLocationCode: "MAD",
                departureDateTimeRange: {
                    date: "2025-05-01",
                    time: "10:00:00"
                }
            }
        ],
        travelers: [{ id: "1", travelerType: "ADULT" }],
        sources: ["GDS"],
        searchCriteria: {
            maxFlightOffers: 5,
            flightFilters: {
                cabinRestrictions: [
                    {
                        cabin: "ECONOMY",
                        coverage: "MOST_SEGMENTS",
                        originDestinationIds: ["1"]
                    }
                ]
            }
        }
    };

    const response = await fetch(flightOffersUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.amadeus+json"
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log(data); // Log the response
    return data; // Return flight offers
}

getFlightOffers().then(data => console.log("Flight Offers:", data));