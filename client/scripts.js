new google.maps.event.addListener(map, 'click', function (event) {

    // marker = new google.maps.Marker({
    //     position: event.latLng,
    //     map: map
    // });

    let lat = event.latLng.lat();
    let lng = (event.latLng.lng());
    console.log(lat, lng);

});