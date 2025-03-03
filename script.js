let userPosition = null;
let watchId = null;
let placedObject = null;

// Start watching the user's position with high accuracy
function startLocationTracking() {
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
            position => {
                userPosition = position;
                updateAccuracyDisplay(position.coords.accuracy);
            },
            error => console.error("Error getting location:", error),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    }
}

// Update the accuracy display
function updateAccuracyDisplay(accuracy) {
    const accuracyDisplay = document.getElementById('accuracy-display');
    accuracyDisplay.textContent = `GPS Accuracy: ${accuracy.toFixed(2)} meters`;
}

// Calculate distance between two points using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Place or update the AR object
function placeObject() {
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);

    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Please enter valid latitude and longitude values');
        return;
    }

    const objectEntity = document.getElementById('placed-object');
    
    // Remove existing object if any
    if (placedObject) {
        objectEntity.removeChild(placedObject);
    }

    // Create new object
    placedObject = document.createElement('a-box');
    placedObject.setAttribute('material', 'color: red');
    placedObject.setAttribute('scale', '1 1 1');
    placedObject.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
    
    objectEntity.appendChild(placedObject);

    // Update distance if we have user's position
    if (userPosition) {
        const distance = calculateDistance(
            userPosition.coords.latitude,
            userPosition.coords.longitude,
            latitude,
            longitude
        );
        document.getElementById('distance-display').textContent = 
            `Distance to object: ${(distance).toFixed(2)} meters`;
    }
}

// Initialize when the page loads
window.onload = () => {
    startLocationTracking();
    
    // If the user's device has GPS
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            // Pre-fill the input fields with the user's current position
            document.getElementById('latitude').value = position.coords.latitude;
            document.getElementById('longitude').value = position.coords.longitude;
        });
    }
};

// Clean up when the page is closed
window.onbeforeunload = () => {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
    }
}; 