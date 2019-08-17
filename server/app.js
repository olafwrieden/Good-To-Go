const coastguard = require("./coastguard.json");
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const d2d = require("degrees-to-direction");
const geolib = require("geolib");
const cors = require('cors')

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
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
      temp_apparent: 13.5,
      wind_speed: 20.3,
      wind_dir: 'ENE',
      text_description: 'Sunny',
      rainfall: 1.2,
      visibility: 2, // km
    },
    marine: {
      swell_height: 10.3, // m
      water_temp: 16.3,
    },
    coastguard_stations: [
      {
        station: 'Auckland',
        lat: -36.8,
        lon: 174.8,
        distance: 2.5, // km
      },
      {
        station: 'Tauranga',
        lat: -32.8,
        lon: 154.8,
        distance: 25.6, // km
      },
    ],
  };

  res.status(200).send(response);
});

// live endpoint, will replace mocked endpoint when deployed
app.get('/dev/info', async (req, res) => {
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

  const API_KEY = process.env.WORLD_WEATHER_KEY;
  const url = `https://api.worldweatheronline.com/premium/v1/marine.ashx?q=${lat},${lon}&key=${API_KEY}&format=json&tp=24`;

  try {
    const data = await axios.get(url);
    const weather = data.data.data.weather[0];
    const current = weather.hourly[0];

    const response = {
      weather: {
        temp_high: Number(weather.maxtempC),
        temp_low: Number(weather.mintempC),
        temp_current: Number(current.tempC),
        temp_apparent: Number(current.FeelsLikeC),
        wind_speed: Number(current.windspeedKmph),
        wind_dir: current.winddir16Point,
        text_description: current.weatherDesc[0].value,
        rainfall: Number(current.precipMM),
        visibility: Number(current.visibility),
      },
      marine: {
        swell_height: Number(current.swellHeight_m),
        water_temp: Number(current.waterTemp_C),
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
