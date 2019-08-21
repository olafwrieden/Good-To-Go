function initMap() {
  // Custom Map Style to Remove Points of Interest (POI)
  var myStyles = [{
    featureType: "poi",
    elementType: "labels",
    stylers: [{
      visibility: "off"
    }]
  }];

  map = new google.maps.Map(document.getElementById("map"), {
    // Set Default Center for Map
    center: {
      lat: -36.848461,
      lng: 174.763336
    },
    // Configure Map Options
    zoom: 9,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    styles: myStyles
  });

  // Target Marker Click Listener 
  google.maps.event.addListener(map, "click", event => {
    clearMarkers();
    addMarker(event.latLng);
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