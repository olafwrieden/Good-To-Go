const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const d2d = require('degrees-to-direction');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('No data to display here. Give /info or /dev/info a try :)');
});

app.get('/info', (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  const response = {
    weather: {
      temp_high: 32.5,
      temp_low: 17.5,
      temp_current: 18.6,
      wind_speed: 20.3,
      wind_dir: 'ENE',
      text_description: 'Sunny',
    },
  };

  res.status(200).send(response);
});

app.get('/dev/info', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (Number(lat) < -86 || Number(lat) > 86) {
    return res.status(400).send('invalid latitude');
  }

  if (Number(lon) < -180 || Number(lon) > 180) {
    return res.status(400).send('invalid longitude');
  }

  const API_KEY = process.env.OPEN_WEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  try {
    const {data} = await axios.get(url);

    const response = {
      weather: {
        temp_high: data.main.temp_max,
        temp_low: data.main.temp_min,
        temp_current: data.main.temp,
        wind_speed: data.wind.speed,
        wind_dir: d2d(data.wind.deg),
        text_description: data.weather[0].description,
      },
    };

    return res.status(200).send(response);
  } catch (error) {
    return res.status(502).send(error.message);
  }
});

app.listen(port, () => console.log(`API Server running on port: ${port}`));
