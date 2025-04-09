document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("flight-status-form");
  const resultsContainer = document.getElementById("flight-status-results");

  // Function to get the access token
  async function getAccessToken() {
    const response = await fetch("/.netlify/functions/getAccessToken");
    const data = await response.json();
    return data.access_token; // Return the token for further API calls
  }

  // Function to fetch flight status data
  const fetchFlightStatus = async (
    carrierCode,
    flightNumber,
    departureDate,
  ) => {
    const apiUrl = `https://test.api.amadeus.com/v2/schedule/flights?carrierCode=${carrierCode}&flightNumber=${flightNumber}&scheduledDepartureDate=${departureDate}`;
    const accessToken = await getAccessToken();

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flight status");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching flight status:", error);
      return [];
    }
  };

  // Function to display flight status results
  const displayResults = (flights) => {
    resultsContainer.innerHTML = ""; // Clear previous results

    if (flights.length === 0) {
      resultsContainer.innerHTML = "<p>No flight status found.</p>";
      return;
    }

    flights.forEach((flight) => {
      const flightItem = document.createElement("div");
      flightItem.classList.add("result-item");

      const departure = flight.flightPoints[0];
      const arrival = flight.flightPoints[1];
      const duration = flight.legs[0].scheduledLegDuration
        .replace("PT", "")
        .toLowerCase();

      // Determine flight status
      let flightStatus = "On Time";
      let statusColor = "green"; // Default to green for "On Time"

      if (
        departure.departure.timings[0].delays &&
        departure.departure.timings[0].delays.length > 0
      ) {
        flightStatus = "Delayed";
        statusColor = "yellow";
      }

      if (flight.flightStatus && flight.flightStatus === "CANCELLED") {
        flightStatus = "Cancelled";
        statusColor = "red";
      }

      flightItem.innerHTML = `
                <h3>Flight ${flight.flightDesignator.carrierCode} ${flight.flightDesignator.flightNumber}</h3>
                <p><strong>Departure:</strong> ${departure.iataCode} at ${new Date(departure.departure.timings[0].value).toLocaleTimeString()}</p>
                <p><strong>Arrival:</strong> ${arrival.iataCode} at ${new Date(arrival.arrival.timings[0].value).toLocaleTimeString()}</p>
                <p><strong>Duration:</strong> ${duration}</p>
                <p><strong>Aircraft:</strong> ${flight.legs[0].aircraftEquipment.aircraftType}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${flightStatus}</span></p>
            `;

      resultsContainer.appendChild(flightItem);
    });
  };

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const carrierCode = document.getElementById("carrier-code").value.trim();
    const flightNumber = document.getElementById("flight-number").value.trim();
    const departureDate = document.getElementById("departure-date").value;

    if (!carrierCode || !flightNumber || !departureDate) {
      alert("Please fill in all fields.");
      return;
    }

    resultsContainer.innerHTML = "<p>Loading...</p>";

    const flights = await fetchFlightStatus(
      carrierCode,
      flightNumber,
      departureDate,
    );
    displayResults(flights);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const carrierCodeInput = document.getElementById("carrier-code");
  const flightNumberInput = document.getElementById("flight-number");
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";

  // Validate Carrier Code
  carrierCodeInput.addEventListener("input", function () {
    carrierCodeInput.value = carrierCodeInput.value.toUpperCase();
    const value = carrierCodeInput.value.trim();
    const isValid = /^[A-Z]{2,3}$/.test(value); // Regex: 2-3 uppercase letters

    if (!isValid) {
      errorElement.textContent =
        "Carrier Code must be 2-3 uppercase letters (e.g., AA, TP).";
      carrierCodeInput.parentElement.appendChild(errorElement);
    } else {
      errorElement.textContent = ""; // Clear error message if valid
    }
  });

  // Validate Flight Number
  flightNumberInput.addEventListener("input", function () {
    const value = flightNumberInput.value.trim();
    const isValid = /^\d+$/.test(value); // Regex: Numbers only

    if (!isValid) {
      errorElement.textContent = "Flight Number must be numeric (e.g., 487).";
      flightNumberInput.parentElement.appendChild(errorElement);
    } else {
      errorElement.textContent = ""; // Clear error message if valid
    }
  });
});
// Array of supported airlines with their IATA codes
const supportedAirlines = [
  { name: "American Airlines", code: "AA" },
  { name: "United Airlines", code: "UA" },
  { name: "Delta Air Lines", code: "DL" },
  { name: "Lufthansa", code: "LH" },
  { name: "British Airways", code: "BA" },
  { name: "Air France", code: "AF" },
  { name: "KLM Royal Dutch Airlines", code: "KL" },
  { name: "Emirates", code: "EK" },
  { name: "Qatar Airways", code: "QR" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Turkish Airlines", code: "TK" },
  { name: "Japan Airlines", code: "JL" },
  { name: "ANA (All Nippon Airways)", code: "NH" },
  { name: "Swiss International Air Lines", code: "LX" },
  { name: "Air India", code: "AI" }
];

// Function to create the supported airlines section
function createSupportedAirlinesSection() {
  const container = document.getElementById('supported-airlines-container');
  
  if (!container) return;
  
  // Create the HTML structure
  container.innerHTML = `
    <div class="supported-airlines-container">
      <div class="supported-airlines-header" id="supported-airlines-toggle">
        <h3>Some Supported Airlines <i class="fa-solid fa-chevron-down"></i></h3>
      </div>
      <div class="supported-airlines-content" id="supported-airlines-list">
        <ul class="airlines-list" id="airlines-list"></ul>
      </div>
    </div>
  `;
  
  // Populate the airlines list
  const airlinesList = document.getElementById('airlines-list');
  
  supportedAirlines.forEach(airline => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<span class="airline-code" data-code="${airline.code}">${airline.code}</span> ${airline.name}`;
    airlinesList.appendChild(listItem);
  });
  
  // Add toggle functionality
  const toggleButton = document.getElementById('supported-airlines-toggle');
  toggleButton.addEventListener('click', function() {
    const airlinesList = document.getElementById('supported-airlines-list');
    const chevron = this.querySelector('i');
    
    if (airlinesList.classList.contains('expanded')) {
      airlinesList.classList.remove('expanded');
      chevron.classList.remove('fa-chevron-up');
      chevron.classList.add('fa-chevron-down');
    } else {
      airlinesList.classList.add('expanded');
      chevron.classList.remove('fa-chevron-down');
      chevron.classList.add('fa-chevron-up');
    }
  });
  
  // Make airline codes clickable
  document.querySelectorAll('.airline-code').forEach(codeElement => {
    codeElement.addEventListener('click', function() {
      const code = this.getAttribute('data-code');
      document.getElementById('carrier-code').value = code;
    });
  });
}

// Initialize the supported airlines section when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  createSupportedAirlinesSection();
});
