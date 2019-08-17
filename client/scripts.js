function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -36.848461, lng: 174.763336 },
        zoom: 8
    });

    var markers = [];
    // Adds a marker to the map and push to the array.
    addMarker = location => {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        markers.push(marker);
    };

    // Sets the map on all markers in the array.
    setMapOnAll = map => {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    };

    // Removes the markers from the map, but keeps them in the array.
    clearMarkers = () => {
        setMapOnAll(null);
    };

    google.maps.event.addListener(map, "click", function(event) {
        clearMarkers();
        addMarker(event.latLng);

        // Bring out drawer, remove obfuscator
        $(".mdl-layout__drawer").addClass("is-visible");
        $(".mdl-layout__obfuscator").removeClass("is-visible");

        getInfo(event);
    });
}

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
            response.json().then(data => console.log);
        })
        .catch(err => console.log);
};

// add stuff here that needs to be done after document load
$(document).ready(function() {});
