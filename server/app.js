const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

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

app.listen(port, () => console.log(`listening on port ${port}`));
