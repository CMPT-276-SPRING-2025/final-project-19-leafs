document.addEventListener('DOMContentLoaded', function () {
    // Retrieve flight offers and user choices from localStorage
    const flightOffers = JSON.parse(localStorage.getItem('flightOffers'));
    const userChoices = JSON.parse(localStorage.getItem('userChoices'));

    // Get the container where flight offers will be displayed
    const flightResultsContainer = document.querySelector('.result-area');
    const priceBar = document.querySelector('.price-bar'); // Price bar section

    // Update the search options with user choices
    document.querySelector('.search-input[placeholder="From"]').value = userChoices.origin;
    document.querySelector('.search-input[placeholder="To"]').value = userChoices.destination;
    document.querySelectorAll('.search-date')[0].value = userChoices.departureDate;
    document.querySelectorAll('.search-date')[1].value = userChoices.returnDate || '';
    document.getElementById('adult-count').textContent = userChoices.adults;
    document.getElementById('child-count').textContent = userChoices.children;

    // Check if there are any saved flight offers
    if (!flightOffers || !flightOffers.data || flightOffers.data.length === 0) {
        flightResultsContainer.innerHTML = '<p>No flight offers found.</p>';
        return;
    }

    // Find the cheapest and most expensive flight prices
    const prices = flightOffers.data.map(offer => parseFloat(offer.price.total));
    const cheapestPrice = Math.min(...prices);
    const mostExpensivePrice = Math.max(...prices);

    // Find the fastest flight (shortest duration)
    const fastestFlight = flightOffers.data.reduce((fastest, current) => {
        const fastestDuration = parseDuration(fastest.itineraries[0].duration);
        const currentDuration = parseDuration(current.itineraries[0].duration);
        return currentDuration < fastestDuration ? current : fastest;
    });

    const fastestPrice = parseFloat(fastestFlight.price.total);

    // Determine the background color for the fastest flight price
    let fastestPriceBackgroundColor = '';
    if (fastestPrice <= cheapestPrice * 1.25) {
        fastestPriceBackgroundColor = '#00cc66'; // Green: <= 25% higher
    } else if (fastestPrice <= cheapestPrice * 1.60) {
        fastestPriceBackgroundColor = '#ffcc00'; // Yellow: > 25% to <= 60% higher
    } else {
        fastestPriceBackgroundColor = '#ff4444'; // Red: > 60% higher
    }

    // Update the price bar with the cheapest, fastest, and most expensive prices
    const priceRangeContainer = priceBar.querySelector('.price-range-inline');
    priceRangeContainer.innerHTML = `
        <div style="color: #00cc66; font-weight: bold;">C$${cheapestPrice.toFixed(2)}</div>
        <div> - </div>
        <div style="color: #ff444; font-weight: bold;">C$${mostExpensivePrice.toFixed(2)}</div>
    `;

    priceBar.querySelector('.best-price .green').textContent = `C$${cheapestPrice.toFixed(2)}`;
    const fastestPriceElement = priceBar.querySelector('.best-price .yellow');
    fastestPriceElement.textContent = `C$${fastestPrice.toFixed(2)}`;
    fastestPriceElement.style.backgroundColor = fastestPriceBackgroundColor; // Set background color
    fastestPriceElement.style.color = '#ffffff'; // Set text color to white
    fastestPriceElement.style.padding = '5px 10px'; // Optional: Add padding for better appearance
    fastestPriceElement.style.borderRadius = '5px'; // Optional: Add rounded corners

    // Render flight offers
    flightResultsContainer.innerHTML = ''; // Clear any existing content
    flightOffers.data.forEach(offer => {
        const flightCard = document.createElement('div');
        flightCard.classList.add('flight-card');

        // Extract flight details
        const itinerary = offer.itineraries[0]; // Assuming the first itinerary
        const segments = itinerary.segments;
        const price = parseFloat(offer.price.total);
        const currency = offer.price.currency;
        const airlineCode = segments[0].carrierCode;
        const airlineName = flightOffers.dictionaries.carriers[airlineCode] || airlineCode;

        // Calculate total stops
        const numberOfStops = segments.length - 1;

        // Extract departure and arrival details
        const departure = segments[0].departure;
        const arrival = segments[segments.length - 1].arrival;

        // Calculate total flight duration
        const totalDuration = itinerary.duration.replace('PT', '').toLowerCase();

        // Format departure and arrival dates and times
        const departureDate = formatDate(departure.at);
        const departureTime = formatTime(departure.at);
        const arrivalDate = formatDate(arrival.at);
        const arrivalTime = formatTime(arrival.at);

        // Determine stop information
        const stopInfo = numberOfStops === 0 ? 'Non-stop' : `${numberOfStops} Stop${numberOfStops > 1 ? 's' : ''}`;

        // Determine price color based on comparison with the cheapest price
        let priceColor = '';
        if (price <= cheapestPrice * 1.25) {
            priceColor = '#00cc66'; // Green: <= 25% higher
        } else if (price <= cheapestPrice * 1.60) {
            priceColor = '#ffcc00'; // Yellow: > 25% to <= 60% higher
        } else {
            priceColor = '#ff4444'; // Red for other prices
        }

        flightCard.innerHTML = `
            <div class="flight-info">
                <div class="airline-name">
                    <strong>${airlineName}</strong>
                </div>
                <div class="flight-time">
                    <strong>${departureDate}</strong><br />
                    <strong>${departureTime}</strong><br />${departure.iataCode}
                </div>
                <div class="flight-middle">
                    <span>Flight Hours: ${totalDuration}</span><br />
                    <span class="material-symbols-rounded">arrow_forward</span><br />
                    ${stopInfo}
                </div>
                <div class="flight-time">
                    <strong>${arrivalDate}</strong><br />
                    <strong>${arrivalTime}</strong><br />${arrival.iataCode}
                </div>
            </div>
            <div class="flight-price">
                <div class="main-price" style="color: ${priceColor};">${currency} ${price.toFixed(2)}</div>
                <button class="details-button">
                  <a href="detailpage.html">
                  <i class="fa-solid fa-circle-info"></i>
                    Details
                  </a>
                </button>
                <button class="favorite-button active">
                    <i class="fa-solid fa-heart"></i>
                </button>   
            </div>
        `;

        flightResultsContainer.appendChild(flightCard);
    });

    // Store flight detail for flight offer if the user asks for detail
    // Add click event listeners to all Details buttons
    document.querySelectorAll('.details-button').forEach((button, index) => {
        button.addEventListener('click', function () {
            // Extract the selected flight offer
            const selectedFlight = flightOffers.data[index];
            const segments = selectedFlight.itineraries[0].segments;

            // Extract stop information
            const stops = segments.slice(1, -1).map(segment => ({
                airport: segment.departure.iataCode,
                arrivalTime: segment.arrival.at,
                departureTime: segment.departure.at
            }));

            // Add stop information to the selected flight object
            const flightWithStops = {
                ...selectedFlight,
                stops
            };

            // Save the selected flight with stops to localStorage
            localStorage.setItem('selectedFlight', JSON.stringify(flightWithStops));

            // Navigate to the detail page
            window.location.href = 'detailpage.html';
        });
    });

    // Retrieve saved flights from localStorage
    const savedFlights = JSON.parse(localStorage.getItem('savedFlights')) || [];

    // Add click event listeners to all favorite buttons
    document.querySelectorAll('.favorite-button').forEach((button, index) => {
        const flightOffer = flightOffers.data[index];

        // Check if the flight is already saved
        if (savedFlights.some(flight => flight.id === flightOffer.id)) {
            button.classList.add('liked'); // Mark as liked
        }

        button.addEventListener('click', function () {
            const isLiked = button.classList.toggle('liked');

            if (isLiked) {
                // Add flight to saved flights
                savedFlights.push(flightOffer);
            } else {
                // Remove flight from saved flights
                const flightIndex = savedFlights.findIndex(flight => flight.id === flightOffer.id);
                if (flightIndex !== -1) {
                    savedFlights.splice(flightIndex, 1);
                }
            }

            // Update localStorage
            localStorage.setItem('savedFlights', JSON.stringify(savedFlights));
        });
    });
});

// Helper function to parse ISO 8601 duration (e.g., "PT14H25M")
function parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes; // Return total duration in minutes
}

// Helper function to format time
function formatTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Helper function to format date
function formatDate(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper function to calculate flight duration
function calculateFlightDuration(departure, arrival) {
    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);
    const duration = new Date(arrivalTime - departureTime);
    const hours = duration.getUTCHours();
    const minutes = duration.getUTCMinutes();
    return `${hours}h ${minutes}m`;
}