const coastguard = require('./coastguard.json');
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const geolib = require('geolib');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT

app.use(cors());
app.use(express.json());
app.use(express.static('public'))

/**
 * Default Route, Render Client Page
 */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

/**
 * Returns the weather info for the given coordinates
 */
app.get('/info', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (lat == null || lon == null) {
    return res.status(400).send('Error: Please provide a lat & lon parameter');
  }

  if (Number(lat) < -86 || Number(lat) > 86) {
    return res.status(400).send('Invalid Latitude');
  }

  if (Number(lon) < -180 || Number(lon) > 180) {
    return res.status(400).send('Invalid Longitude');
  }

  const API_KEY = process.env.WORLD_WEATHER_KEY;
  const url = `https://api.worldweatheronline.com/premium/v1/marine.ashx?q=${lat},${lon}&key=${API_KEY}&format=json&tp=24`;

  try {
    // Request Weather Data
    const data = await axios.get(url);
    const weather = data.data.data.weather[0];
    const current = weather.hourly[0];

    // Construct API Response
    let response = {
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
      coastguard_stations: await closestStation({
        lat,
        lon
      }),
    };

    // Perform Recommendation
    response = recommend(response);

    return res.status(200).send(response);
  } catch (error) {
    return res.status(502).send(error.message);
  }
});

/**
 * Return all Coastguard Station Locations
 */
app.get('/coastguard', (req, res) => {
  res.status(200).send(coastguard);
});

/**
 * Get's Coastguard Stations Closest to the input location
 * @param {Object} location the user's selected location
 */
const closestStation = async location => {
  coastguard.forEach(station => {
    // Get Distance
    let distance = geolib.getDistance({
      latitude: location.lat,
      longitude: location.lon
    }, {
      latitude: station.lat,
      longitude: station.lon
    }, );
    // Append Distance to Object
    station['distance'] = distance;
  });

  // Sort by Nearest
  coastguard.sort(function (a, b) {
    if (a.distance < b.distance) return -1;
    if (a.distance > b.distance) return 1;
    return 0;
  });

  // Return Closest Two Stations
  return coastguard.slice(0, 2);
};

/**
 * Recommendation Engine, returns complete object with recommendation
 * @param {Object} info the structured response object
 */
const recommend = info => {
  const reasons = [];

  if (info.weather.wind_speed > 40) {
    reasons.push('Wind speed is greater than 40 kmph');
  }
  if (info.weather.visibility < 2) {
    reasons.push('Visibility is less than 1 km');
  }
  if (info.marine.swell_height > 3) {
    reasons.push('Swell height is greater than 3 m');
  }

  const recommendation = {
    safe: reasons.length == 0,
    reasons,
  };

  return {
    ...info,
    recommendation
  };
};

/**
 * App Listener
 */
app.listen(port, () => console.log(`API Server running on port: ${port}`));