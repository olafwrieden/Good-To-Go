google.maps.event.addListener(map, 'click', function (event) {

    // marker = new google.maps.Marker({
    //     position: event.latLng,
    //     map: map
    // });

    let lat = event.latLng.lat();
    let lon = (event.latLng.lng());
    console.log(lat, lon);

    fetch(`http://localhost:3000/info?lat=${lat}&lon=${lon}`).then(response => {
        if (response.status !== 200) {
            console.log("There was a problem, status code: " + response.status);
            return;
        }
        response.json().then(data => console.log);
    }).catch(err => console.log);

});

function writeInfo() {
    document.getElementById("p1").innerHTML = "<h2>Weather</h2>";
}