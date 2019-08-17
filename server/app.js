const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res
    .status(200)
    .send('No data to display here. Give /info or /dev/info a try :)');
});

// currently mocked out for front-end testing
app.get('/info', (req, res) => {
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
  };

  res.status(200).send(response);
});

// live endpoint, will replace mocked endpoint when deployed
app.get('/dev/info', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (Number(lat) < -86 || Number(lat) > 86) {
    return res.status(400).send('invalid latitude');
  }

  if (Number(lon) < -180 || Number(lon) > 180) {
    return res.status(400).send('invalid longitude');
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
    };

    return res.status(200).send(response);
  } catch (error) {
    return res.status(502).send(error.message);
  }
});

app.listen(port, () => console.log(`API Server running on port: ${port}`));
