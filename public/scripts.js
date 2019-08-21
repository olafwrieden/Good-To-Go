var markers = [];
var map;

/**
 * Adds a Location Marker to the Map
 * @param {*} location the target location where the user wishes to check
 * @param {*} currentLocation optional: if true, marker should be red to depict current location
 */
const addMarker = (location, currentLocation = false) => {
	// Set Corresponding Marker Icon and Size
	let markerIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
	if (currentLocation) {
		markerIcon = "https://maps.google.com/mapfiles/kml/shapes/placemark_circle_highlight.png";
	}
	let size = currentLocation ? 30 : 50

	// Create Marker
	var marker = new google.maps.Marker({
		position: location,
		map,
		icon: {
			url: markerIcon,
			scaledSize: new google.maps.Size(size, size) // scaled size
		}
	});

	markers.push(marker);
};

/**
 * Adds a Coastguard Station Marker
 * @param {Object} coastguard a coastguard station to plot
 */
const addCoastguardMarker = coastguard => {
	// Format Info Window Content
	var infowindow = new google.maps.InfoWindow({
		content: `<b>Station: ${coastguard.station}</b><br>${metresToKm(coastguard.distance)} km away`,
	});

	// Create a Custom Marker
	var marker = new google.maps.Marker({
		title: `Station: ${coastguard.station}`,
		position: new google.maps.LatLng(coastguard.lat, coastguard.lon),
		map,
		icon: {
			url: "https://maps.google.com/mapfiles/kml/pal3/icon46.png",
			scaledSize: new google.maps.Size(30, 30) // scaled size
		}
	});

	// Add Info Window to Marker
	marker.addListener('click', function () {
		infowindow.open(map, marker);
	});

	markers.push(marker);
};

/**
 * Sets the Map on all Markers
 * @param {Object} map the current map instance
 */
const setMapOnAll = map => {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
};

/**
 * Removes the markers from the map, but keeps them in the array.
 */
const clearMarkers = () => {
	setMapOnAll(null);
};

/**
 * Shows 'Loading...' Text while Map Loads
 */
const displayLoading = () => {
	$("#loading").html(`<h2 style="text-align: center"> Loading... </h2>`);
};

/**
 * Shows Recommendation with Reasons
 */
const displayInfo = () => {
	$("#loading").html(`
		<span id="recommendation">
			<div id="icon" class="gap_left"></div>
			<ul id="reasons"></ul>
		</span>
	`);
};

/**
 * Queries the API for Data about the Selected Coordinates
 * @param {Object} event the map location clicked by the user
 */
const getInfo = event => {
	let lat = event.latLng.lat();
	let lon = event.latLng.lng();
	displayLoading();
	$("#latlng-header").empty();
	fetch(`/info?lat=${lat}&lon=${lon}`)
		.then(response => {
			if (response.status !== 200) {
				console.log("There was a problem, status code: " + response.status);
				return;
			}
			response.json().then(data => {
				displayInfo();
				updateInfo(data);
				displayRecommendation(data, lat, lon);
			});
		})
		.catch(err => console.log(err));
};

/**
 * Everything that needs to be done after the document loads
 */
$(document).ready(function () {
	$(".drawer-button").click(() => {
		$(".mdl-layout__drawer").removeClass("is-visible");
		clearMarkers();
	});

	setCurrentLocation();
});

/**
 * Adds a Marker at the User's Current Location
 */
const setCurrentLocation = () => {
	// Check if Browser Supports Geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			position => {
				// Create LatLng Object
				let posMarker = new google.maps.LatLng(
					position.coords.latitude,
					position.coords.longitude
				);

				// Add Current Location Marker to Map
				addMarker(posMarker, true);
			},
			(error = err => {
				console.log("Error: " + err.message);
			})
		);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
};

/**
 * Inserts the API data into its appropiate HTML location
 * @param {Object} data the data object returned by the API call
 */
const updateInfo = data => {
	// Insert Data
	$("#temp_apparent").html(data.weather.temp_apparent);
	$("#temp_current").html(data.weather.temp_current);
	$("#temp_high").html(data.weather.temp_high);
	$("#temp_low").html(data.weather.temp_low);
	$("#rainfall").html(data.weather.rainfall);
	$("#text_description").html(data.weather.text_description);
	$("#wind_dir").html(data.weather.wind_dir);
	$("#wind_speed").html(data.weather.wind_speed);
	$("#swell_height").html(data.marine.swell_height);
	$("#water_temp").html(data.marine.water_temp);
	$("#visibility").html(data.weather.visibility);

	// Render Markers
	renderCoastGuardMarkers(data.coastguard_stations);
	renderNearestCoastGuard(data.coastguard_stations);
};

/**
 * Renders the Nearest Coastguard Station
 * @param {Array} coastguard_stations array of top two closest stations
 */
const renderNearestCoastGuard = coastguard_stations => {
	// Find closest Coastguard (distance-based)
	let nearestCoastguard = coastguard_stations.reduce((prev, current) => {
		return prev.distance < current.distance ? prev : current;
	});

	// Render Coastguard Information
	$("#coastguard-location").html(nearestCoastguard.station);
	let distanceInKm = metresToKm(nearestCoastguard.distance);
	$("#coastguard-distance").html(`${distanceInKm} km away`);
};

/**
 * Converts Meters (m) to Kilometers (km)
 * @param {Number} distanceInM the number of meters (distance)
 */
const metresToKm = distanceInM => {
	let distanceInKm = distanceInM / 1000;
	return distanceInKm.toFixed(1);
};

/**
 * Calls the Coastguard Marker Render Function
 * @param {Array} coastguard_stations the stations to render as markers
 */
const renderCoastGuardMarkers = coastguard_stations => {
	coastguard_stations.forEach(coastguard => {
		addCoastguardMarker(coastguard);
	});
};

/**
 * Display's Final Recommendation
 * @param {Object} data the data object returned by the API
 * @param {Double} lat the latitude of the coordinate
 * @param {*} lon the longitude of the coordinate
 */
const displayRecommendation = (data, lat, lon) => {
	lat = Number(lat).toFixed(2);
	lon = Number(lon).toFixed(2);

	// Show Coordinates Clicked
	const location = `latitude: ${lat}, longitude: ${lon}`;
	$("#latlng-header").html(location);

	// Render Recommendation
	if (data.recommendation.safe) {
		$("#icon").html(
			`<h2>You're good to go!  <i class="fas fa-check fa-x" style="color:green"></h2></i>`
		);
	} else {
		$("#icon").html(`
		<h2>You're not good to go.  <i class="fas fa-times fa-x" style="color:red"></h2></i>`);
	}

	// Render Recommendation Reasons
	$("#reasons").empty();
	data.recommendation.reasons.forEach(item =>
		$("#reasons").append(`<li>${item}</li>`)
	);
};