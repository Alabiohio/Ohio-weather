  const weatherCodeMap = {
    0: { desc: "Clear sky", icon: "01d" },
    1: { desc: "Mainly clear", icon: "02d" },
    2: { desc: "Partly cloudy", icon: "03d" },
    3: { desc: "Overcast", icon: "04d" },
    45: { desc: "Fog", icon: "50d" },
    48: { desc: "Depositing rime fog", icon: "50d" },
    51: { desc: "Light drizzle", icon: "09d" },
    53: { desc: "Moderate drizzle", icon: "09d" },
    55: { desc: "Dense drizzle", icon: "09d" },
    56: { desc: "Light freezing drizzle", icon: "13d" },
    57: { desc: "Dense freezing drizzle", icon: "13d" },
    61: { desc: "Slight rain", icon: "10d" },
    63: { desc: "Moderate rain", icon: "10d" },
    65: { desc: "Heavy rain", icon: "10d" },
    66: { desc: "Light freezing rain", icon: "13d" },
    67: { desc: "Heavy freezing rain", icon: "13d" },
    71: { desc: "Slight snow", icon: "13d" },
    73: { desc: "Moderate snow", icon: "13d" },
    75: { desc: "Heavy snow", icon: "13d" },
    77: { desc: "Snow grains", icon: "13d" },
    80: { desc: "Slight showers", icon: "09d" },
    81: { desc: "Moderate showers", icon: "09d" },
    82: { desc: "Violent showers", icon: "09d" },
    85: { desc: "Slight snow showers", icon: "13d" },
    86: { desc: "Heavy snow showers", icon: "13d" },
    95: { desc: "Thunderstorm", icon: "11d" },
    96: { desc: "Thunderstorm with hail", icon: "11d" },
    99: { desc: "Thunderstorm with heavy hail", icon: "11d" }
  };

  async function getForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation,rain,snowfall,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_direction_10m,weathercode&timezone=auto`;
    
    const res = await fetch(url);
    const data = await res.json();

    const container = document.getElementById('forecast');
    const now = new Date();
    const currentHourIndex = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());

    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) { 
      const hourCard = document.createElement('div');
      hourCard.className = 'hour-card';

      // Get weather code details
      const code = data.hourly.weathercode[i];
      const weather = weatherCodeMap[code] || { desc: "Unknown", icon: "01d" };

      hourCard.innerHTML = `
        <div class="grid-x grid-margin-x">
          
          <div>
            <span style="font-size: 0.9rem; font-weight: 600">
              ${new Date(data.hourly.time[i]).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
          
          <div class="text-right" style="margin-left: 0.9rem;">
            <img style="height: 35px; width: 35px" src="https://openweathermap.org/img/wn/${weather.icon}.png" 
                 alt="${weather.desc}" title="${weather.desc}" />
            <span style="font-size: 1.3rem"> ${data.hourly.temperature_2m[i].toFixed()}°</span>
          </div>
          
          <div class="text-right" style="margin-left: 1rem; margin-right: 0.7rem;">
            <span style="font-size: 0.9rem; font-weight: 300; color: #444;">
              Feels Like ${data.hourly.apparent_temperature[i]} °C
            </span>
          </div>

          <div class="cell small-3">
            <i class="fas fa-droplet" style="color: #666"></i>
            <span style="font-weight: 600; color: #666"> ${data.hourly.relative_humidity_2m[i]} %</span>
          </div>
        </div>
        
        <div style="margin-top: 1rem; font-weight: 600; color:#333;">
          ${weather.desc}
        </div>

        <div class="info"><span class="label">Humidity:</span> ${data.hourly.relative_humidity_2m[i]} %</div>
        <div class="info"><span class="label">Dew Point:</span> ${data.hourly.dew_point_2m[i]} °C</div>
        <div class="info"><span class="label">Precipitation:</span> ${data.hourly.precipitation[i]} mm</div>
        <div class="info"><span class="label">Rain:</span> ${data.hourly.rain[i]} mm</div>
        <div class="info"><span class="label">Snowfall:</span> ${data.hourly.snowfall[i]} cm</div>
        <div class="info"><span class="label">Cloud Cover:</span> ${data.hourly.cloudcover[i]} %</div>
        <div class="info"><span class="label">Low Clouds:</span> ${data.hourly.cloudcover_low[i]} %</div>
        <div class="info"><span class="label">Mid Clouds:</span> ${data.hourly.cloudcover_mid[i]} %</div>
        <div class="info"><span class="label">High Clouds:</span> ${data.hourly.cloudcover_high[i]} %</div>
        <div class="info"><span class="label">Evapotranspiration:</span> ${data.hourly.evapotranspiration[i]} mm</div>
        <div class="info"><span class="label">Vapor Pressure Deficit:</span> ${data.hourly.vapour_pressure_deficit[i]} kPa</div>
        <div class="info"><span class="label">Wind Speed:</span> ${data.hourly.wind_speed_10m[i]} m/s</div>
        <div class="info"><span class="label">Wind Direction:</span> ${data.hourly.wind_direction_10m[i]} °</div>
      `;
      container.appendChild(hourCard);
    }
  }

  // Get user's location
  navigator.geolocation.getCurrentPosition(
    pos => getForecast(pos.coords.latitude, pos.coords.longitude),
    () => getForecast(6.5244, 3.3792) // fallback: Lagos, Nigeria
  );

