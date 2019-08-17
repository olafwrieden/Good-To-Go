const coastguard = require("./coastguard.json");
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const d2d = require("degrees-to-direction");
const geolib = require("geolib");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Default Route, No Data!
app.get("/", (req, res) => {
  res
    .status(200)
    .send("No data to display here. Give /info or /dev/info a try :)");
});

// Returns the weather info for the given coordinates. TODO: Switch Over To Live Data
app.get("/info", (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  const response = {
    weather: {
      temp_high: 32.5,
      temp_low: 17.5,
      temp_current: 18.6,
      wind_speed: 20.3,
      wind_dir: "ENE",
      text_description: "Sunny"
    }
  };

  res.status(200).send(response);
});

// Live Weather Data for the Given Lat Lon
app.get("/dev/info", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (lat == null || lon == null) {
    return res.status(400).send("Error: Please provide a lat & lon parameters");
  }

  if (Number(lat) < -86 || Number(lat) > 86) {
    return res.status(400).send("invalid latitude");
  }

  if (Number(lon) < -180 || Number(lon) > 180) {
    return res.status(400).send("invalid longitude");
  }

  const API_KEY = process.env.OPEN_WEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  try {
    const { data } = await axios.get(url);

    const response = {
      weather: {
        temp_high: data.main.temp_max,
        temp_low: data.main.temp_min,
        temp_current: data.main.temp,
        wind_speed: data.wind.speed,
        wind_dir: d2d(data.wind.deg),
        text_description: data.weather[0].description
      },
      coastguard_stations: await closestStation({ lat, lon })
    };

    return res.status(200).send(response);
  } catch (error) {
    return res.status(502).send(error.message);
  }
});

// Location of Coastguard Stations
app.get("/coastguard", (req, res) => {
  res.status(200).send(coastguard);
});

// Get's Coastguard Stations Closest to the Coordinates.
const closestStation = async location => {
  coastguard.forEach(station => {
    // Get Distance
    let distance = geolib.getDistance(
      { latitude: location.lat, longitude: location.lon },
      { latitude: station.lat, longitude: station.lon }
    );
    // Append it to Object
    station["distance"] = distance;
  });

  // Sort by Nearest
  coastguard.sort(function(a, b) {
    if (a.distance < b.distance) return -1;
    if (a.distance > b.distance) return 1;
    return 0;
  });

  return coastguard.slice(0, 2);
};

app.listen(port, () => console.log(`API Server running on port: ${port}`));
