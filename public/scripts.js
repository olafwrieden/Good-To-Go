var markers = [];
var map;

// Adds a marker to the map and push to the array.
const addMarker = location => {
    var marker = new google.maps.Marker({
        position: location,
        map,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(50, 50) // scaled size
        }
    });
    markers.push(marker);
};

const addCoastguardMarker = coastguard => {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(coastguard.lat, coastguard.lon),
        map,
        icon: {
            url: "https://maps.google.com/mapfiles/kml/pal3/icon46.png",
            scaledSize: new google.maps.Size(30, 30) // scaled size
        }
    });
    markers.push(marker);
};

// Sets the map on all markers in the array.
const setMapOnAll = map => {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
};

// Removes the markers from the map, but keeps them in the array.
const clearMarkers = () => {
    setMapOnAll(null);
};

displayLoading = () => {
    $("#loading").html(`<h2 style="text-align: center"> Loading... </h2>`);
};

displayInfo = () => {
    $("#loading").html(`
    <span class="drawer-header">
                    <span class=" width_wrapper vertical-center"
                                id="sidebar-title">Loading...</span>

                    <!-- Colored FAB button with ripple -->
                    <button
                        class="drawer-button"
                    >
                    <i class="fas fa-times"></i>
                    </button>
                </span>

                <span id="recommendation">
                <div id="icon" class="gap_left"></div>
                <ul id="reasons"></ul>
                </span>
                `);
};

getInfo = event => {
    let lat = event.latLng.lat();
    let lon = event.latLng.lng();
    displayLoading();
    fetch(`/dev/info?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (response.status !== 200) {
                console.log(
                    "There was a problem, status code: " + response.status
                );
                return;
            }
            response.json().then(data => {
                console.log(data);
                displayInfo();
                updateInfo(data);
                displayRecommendation(data, lat, lon);
            });
        })
        .catch(err => console.log);
};

// add stuff here that needs to be done after document load
$(document).ready(function() {
    $(".drawer-button").click(() => {
        $(".mdl-layout__drawer").removeClass("is-visible");
        clearMarkers();
    });

    setCurrentLocation();
});

// Adds a marker at the current users location
const setCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                let posMarker = new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                );

                // add marker for current location
                addMarker(posMarker);
            },
            (error = err => {
                console.log("error: " + err.message);
            })
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

const updateInfo = data => {
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
    renderCoastGuardMarkers(data.coastguard_stations);
    renderNearestCoastGuard(data.coastguard_stations);
};
const renderNearestCoastGuard = coastguard_stations => {
    // find coast guard minimum distance away
    let nearestCoastguard = coastguard_stations.reduce((prev, current) => {
        return prev.distance < current.distance ? prev : current;
    });

    // render info
    $("#coastguard-location").html(nearestCoastguard.station);
    let distanceInKm = metresToKm(nearestCoastguard.distance);
    $("#coastguard-distance").html(`${distanceInKm} km away`);
};

const metresToKm = distanceInKm => {
    let distanceInM = distanceInKm / 1000;
    return distanceInM.toFixed(1);
};

const renderCoastGuardMarkers = coastguard_stations => {
    coastguard_stations.forEach(coastguard => {
        addCoastguardMarker(coastguard);
    });
};

const displayRecommendation = (data, lat, lon) => {
    lat = Number(lat).toFixed(2);
    lon = Number(lon).toFixed(2);

    const location = `lattitude: ${lat}, longitude: ${lon}`;
    $("#sidebar-title").html(location);

    if (data.recommendation.safe) {
        $("#icon").html(
            `<h2>You're good to go!  <i class="fas fa-check fa-x" style="color:green"></h2></i>`
        );
    } else {
        $("#icon").html(`
        <h2>You're not good to go.  <i class="fas fa-times fa-x" style="color:red"></h2></i>`);
    }

    $("#reasons").empty();
    data.recommendation.reasons.forEach(item =>
        $("#reasons").append(`<li>${item}</li>`)
    );
};
