import fetch from 'node-fetch';

const urls = [
  {
    name: 'Open-Meteo',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=6.25&longitude=-75.56&current_weather=true'
  },
  {
    name: 'Met.no',
    url: 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=6.25184&lon=-75.56359'
  }
];

const getWeatherData = ({ name, url }) =>
  fetch(url, {
    headers: name === 'Met.no' ? {
      'User-Agent': 'weather-medellin-app/1.0' // Met.no requiere User-Agent
    } : {}
  })
  .then(res => {
    if (!res.ok) throw new Error(`${name} - HTTP error ${res.status}`);
    return res.json();
  })
  .then(data => ({ name, data }));

Promise.race(urls.map(getWeatherData))
  .then(({ name, data }) => {
    let temperature;

    if (name === 'Open-Meteo' && data.current_weather) {
      temperature = data.current_weather.temperature;
    } else if (name === 'Met.no' && data.properties?.timeseries?.[0]?.data?.instant?.details?.air_temperature !== undefined) {
      temperature = data.properties.timeseries[0].data.instant.details.air_temperature;
    }

    if (temperature !== undefined) {
      console.log(`🌤️ ${name} respondió primero: ${temperature} °C`);
    } else {
      console.log(`⚠️ ${name} respondió primero, pero no se pudo leer la temperatura.`);
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
