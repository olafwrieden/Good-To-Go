var markers = [];
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -36.848461, lng: 174.763336 },
        zoom: 8
    });

    google.maps.event.addListener(map, "click", function(event) {
        clearMarkers();
        addMarker(event.latLng);

        // Bring out drawer, remove obfuscator
        $(".mdl-layout__drawer").addClass("is-visible");
        $(".mdl-layout__obfuscator").removeClass("is-visible");

        getInfo(event);
    });
}

// Adds a marker to the map and push to the array.
var addMarker = location => {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
};

// Sets the map on all markers in the array.
var setMapOnAll = map => {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
};

// Removes the markers from the map, but keeps them in the array.
var clearMarkers = () => {
    setMapOnAll(null);
};

getInfo = event => {
    let lat = event.latLng.lat();
    let lon = event.latLng.lng();
    console.log(lat, lon);

    fetch(`http://localhost:3000/info?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (response.status !== 200) {
                console.log(
                    "There was a problem, status code: " + response.status
                );
                return;
            }
            response.json().then(data => {
                console.log(data);
                updateInfo(data);
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
});

var updateInfo = data => {
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
};
