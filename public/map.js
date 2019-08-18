function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -36.848461, lng: 174.763336 },
        zoom: 9
    });

    google.maps.event.addListener(map, "click", event => {
        clearMarkers();
        addMarker(event.latLng);

        // Bring out drawer, remove obfuscator
        $(".mdl-layout__drawer").addClass("is-visible");
        $(".mdl-layout__obfuscator").removeClass("is-visible");

        getInfo(event);
    });
}
