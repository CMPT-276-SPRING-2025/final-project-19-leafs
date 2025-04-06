document.addEventListener('DOMContentLoaded', function () {
    // Retrieve the selected flight data from localStorage
    const selectedFlight = JSON.parse(localStorage.getItem('selectedFlight'));
    const savedFlights = JSON.parse(localStorage.getItem('savedFlights')) || [];

    if (!selectedFlight) {
        // Redirect back to search page if no flight data is found
        window.location.href = 'searchpage.html';
        return;
    }

    // Populate the flight details in the header card
    const flightRouteElement = document.querySelector('.flight-route');
    const flightDateElement = document.querySelector('.flight-date');
    const timeNoteElement = document.querySelector('.time-note');

    flightRouteElement.innerHTML = `
        <strong>${selectedFlight.itineraries[0].segments[0].departure.iataCode}</strong>
        <span class="route-line-arrow"></span>
        <strong>${selectedFlight.itineraries[0].segments.slice(-1)[0].arrival.iataCode}</strong>
    `;
    flightDateElement.textContent = new Date(selectedFlight.itineraries[0].segments[0].departure.at).toDateString();
    timeNoteElement.textContent = "All times are local";

    // Populate the flight details in the main card
    const flightDetailsElement = document.querySelector('.flight-details');
    flightDetailsElement.innerHTML = `
        <div>
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/WestJet_logo_2016.svg/320px-WestJet_logo_2016.svg.png" alt="Airline Logo" width="70"/>
        </div>
        <div>
            <div>${new Date(selectedFlight.itineraries[0].segments[0].departure.at).toLocaleTimeString()}</div>
            <div>${selectedFlight.itineraries[0].segments[0].departure.iataCode}</div>
        </div>
        <div>
            <div>Flight Hours: ${selectedFlight.itineraries[0].duration.replace('PT', '').toLowerCase()}</div>
            <div><svg class="svg-arrow" viewBox="0 0 200 2" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="1" x2="190" y2="1" stroke="black" stroke-width="2"/>
                <polyline points="190,0 200,1 190,2" fill="none" stroke="black" stroke-width="2"/>
            </svg></div>
            <div>Direct</div>
        </div>
        <div>
            <div>${new Date(selectedFlight.itineraries[0].segments.slice(-1)[0].arrival.at).toLocaleTimeString()}</div>
            <div>${selectedFlight.itineraries[0].segments.slice(-1)[0].arrival.iataCode}</div>
        </div>
    `;

    // Populate the flight details in the side panel
    const sidePanelElement = document.querySelector('.side-panel');
    sidePanelElement.innerHTML = `
        <div class="price">C$${selectedFlight.price.total}</div>
        <button class="favorite-button">
            <i class="fa-solid fa-heart"></i>
            <div style="font-weight: bold; margin-top: 0%; padding: 9px;">Add to saved flights</div>
        </button>     
        <button class="book-btn">Book on Airline website</button>
    `;

    // Handle the favorite button
    const favoriteButton = document.querySelector('.favorite-button');

    // Check if the flight is already saved
    if (savedFlights.some(flight => flight.id === selectedFlight.id)) {
        favoriteButton.classList.add('liked'); // Mark as liked
        favoriteButton.querySelector('i').style.color = 'red'; // Change heart color to red
    }

    favoriteButton.addEventListener('click', function () {
        const isLiked = favoriteButton.classList.toggle('liked');

        if (isLiked) {
            // Add flight to saved flights
            savedFlights.push(selectedFlight);
            favoriteButton.querySelector('i').style.color = 'red'; // Change heart color to red
        } else {
            // Remove flight from saved flights
            const flightIndex = savedFlights.findIndex(flight => flight.id === selectedFlight.id);
            if (flightIndex !== -1) {
                savedFlights.splice(flightIndex, 1);
            }
            favoriteButton.querySelector('i').style.color = ''; // Reset heart color
        }

        // Update localStorage
        localStorage.setItem('savedFlights', JSON.stringify(savedFlights));
    });

    // Populate the flight details in the WS body
    const wsHeaderElement = document.querySelector('.ws-header');
    const wsBodyElement = document.querySelector('.ws-body');

    wsHeaderElement.innerHTML = `<strong>${selectedFlight.itineraries[0].segments[0].carrierCode} ${selectedFlight.itineraries[0].segments[0].flightNumber}</strong>`;
    wsBodyElement.innerHTML = `
        <div class="ws-time-column">
            <div>${new Date(selectedFlight.itineraries[0].segments[0].departure.at).toLocaleTimeString()}</div>
            <div class="down-arrow-line"></div>
            <div>${new Date(selectedFlight.itineraries[0].segments.slice(-1)[0].arrival.at).toLocaleTimeString()}</div>
        </div>            
        <div class="ws-airport-column">
            <div>${selectedFlight.itineraries[0].segments[0].departure.iataCode} International Airport</div>
            <div>${selectedFlight.itineraries[0].segments.slice(-1)[0].arrival.iataCode} International Airport</div>
        </div>
        <div class="ws-meta-column">
            <div>Arrives: <strong>${new Date(selectedFlight.itineraries[0].segments.slice(-1)[0].arrival.at).toDateString()}</strong></div>
            <div>Flight hours: ${selectedFlight.itineraries[0].duration.replace('PT', '').toLowerCase()}</div>
        </div>
    `;

    // Add event listener for the back button
    document.querySelector('.back-button').addEventListener('click', function () {
        localStorage.removeItem('selectedFlight');
        window.location.href = 'searchpage.html';
    });
});