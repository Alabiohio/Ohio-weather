const apiKey = "a5f38331f2b3856002a17a3d8815b4c3";
const locaName = document.getElementById('locaName');
const temp = document.getElementById('temp');
const weaInfo = document.getElementById('weaInfo');
const cty = document.getElementById('cityInput');
const ctyI = document.getElementById('cityInputI');
const humid = document.getElementById('humid');
const realfeal = document.getElementById('realFeel');
const uvDisplay = document.getElementById('uvI');
const pressure = document.getElementById('pressure');
const chanceOfRain = document.getElementById('rain');
const speed = document.getElementById('speed');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const forecastContainer = document.getElementById('fiveDysBox');
const forecastContainerI = document.getElementById('temp24');
const forecastContainerII = document.getElementById('icon');
const forecastContainerIII = document.getElementById('wind');
const forecastContainerIV = document.getElementById('times');
const aqiBox = document.getElementById('aqiBox');
const threeDysBox = document.getElementById('threeDysF');
const forecastContainer24 = document.getElementById('tFhrsBox');
const landPg   = document.querySelector(".toAdd");
const load   = document.querySelector(".load");
const mainCont = document.getElementById('mainCont');
const latUser = localStorage.getItem('userLat');
const lonUser = localStorage.getItem('userLon' );

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
// Fetch weather and forecast data
async function fetchWeatherAndForecast(cityOrLat, lon = null) {
    const weatherUrl = lon
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${cityOrLat}&lon=${lon}&appid=${apiKey}&units=metric`
        : `https://api.openweathermap.org/data/2.5/weather?q=${cityOrLat}&appid=${apiKey}&units=metric`;

    const forecastUrl = lon
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${cityOrLat}&lon=${lon}&appid=${apiKey}&units=metric`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${cityOrLat}&appid=${apiKey}&units=metric`;

    let aqiUrl = '';
    if (lon) {
        aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${cityOrLat}&lon=${lon}&appid=${apiKey}`;
    } else {
        // First, use the Geocoding API to get latitude and longitude for the city name
        const geocodeUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrLat}&appid=${apiKey}`;
        try {
            const geocodeResponse = await fetch(geocodeUrl);
            if (!geocodeResponse.ok) {
                throw new Error(`Geocoding API Error: ${geocodeResponse.status}`);
            }
            const geocodeData = await geocodeResponse.json();
            const lat = geocodeData.coord.lat;
            const lon = geocodeData.coord.lon;

            // Now we have lat and lon, create the AQI URL
            aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        } catch (error) {
            console.error("Error fetching geolocation:", error.message);
            locaName.textContent = "Invalid city name!";
            return;
        }
    }

    try {
        // Show loading feedback
        mainCont.style.display = "block";
        locaName.textContent = "Loading...";
        temp.textContent = "";
        weaInfo.textContent = "";
        forecastContainerI.innerHTML = "";
        forecastContainerII.innerHTML = "";
        threeDysBox.innerHTML = "";
        
        await delay(2000);
        
        const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl),
            fetch(aqiUrl)
        ]);

        if (!weatherResponse.ok) {
            throw new Error(`Weather API Error: ${weatherResponse.status}`);
        }
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API Error: ${forecastResponse.status}`);
        }
        if (!aqiResponse.ok) {
            throw new Error(`AQI API Error: ${aqiResponse.status}`);
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        const aqiData = await aqiResponse.json();

        // Update DOM with weather data
        locaName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
        temp.innerHTML = `${Math.floor(weatherData.main.temp)}°<sup>c</sup>`;
        weaInfo.textContent = `${weatherData.weather[0].description}`;
        humid.textContent = `${weatherData.main.humidity}%`;
        pressure.innerHTML = `${Math.floor(weatherData.main.pressure * 0.750062)}mmHg`;
        realfeal.textContent = `${weatherData.main.feels_like} °C`;

        speed.textContent = `Wind Speed: ${weatherData.wind.speed} m/s`;
        sunrise.textContent = `${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} Sunrise`;
        sunset.textContent = `${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} Sunset`;
        
        const days = {};
        
        // Group forecasts by date
        forecastData.list.forEach(item => {
            const date = new Date(item.dt_txt);
            const dayKey = date.toDateString(); // e.g. "Mon Aug 18 2025"
            if (!days[dayKey]) days[dayKey] = [];
            days[dayKey].push(item);
        });

        const dayNames = Object.keys(days).slice(0, 3).map((dateStr, index) => {
            if (index === 0) return 'Today';
            if (index === 1) return 'Tomorrow';
            return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
        });
        
        // Loop through days and calculate temperature range and weather condition
        Object.entries(days).slice(0, 3).forEach(([dateStr, forecasts], i) => {
            const dayName = dayNames[i]; // Map the name (Today, Tomorrow, etc.)
            
            // Get all the temperatures for the day
            const temps = forecasts.map(f => f.main.temp);
            
            // Find min and max temperatures for that day
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            
            // Get the main weather condition for the day (use the first item for simplicity)
            const weatherCondition = forecasts[0].weather[0].description;
            
            
            const weatherIcon = forecasts[0].weather[0].icon; // e.g. "01d", "03n", etc.
            
            // Build the icon URL
            const iconUrl = `http://openweathermap.org/img/wn/${weatherIcon}.png`;
            
            // Build the HTML content for each day with the weather icon
            const row = `
            <tr>
               <td><img src="${iconUrl}" alt="${weatherCondition}" width="30" height="30"> ${dayName} ${weatherCondition}</td>
               <td>${maxTemp.toFixed(0)}°/${minTemp.toFixed(0)}°</td>
            </tr>
            `;
            
            // Append the row for each day
            threeDysBox.innerHTML += row;
        });
        

          // Fetch hourly forecast & UV from Open-Meteo
        const { lat, lon: longitude } = weatherData.coord;
        getOpenMeteoForecast(lat, longitude);

        // Display AQI data
        aqiBox.textContent = `AQI ${aqiData.list[0].main.aqi}`;

        console.log("Weather Data:", weatherData);
        console.log("Forecast Data:", forecastData);
        console.log("AQI Data:", aqiData);

    } catch (error) {
        console.error("Error fetching weather/forecast/AQI data:", error.message);
        locaName.textContent = "Something went wrong!";
    } finally {
        if (landPg) {
            landPg.style.display = "none";
            mainCont.style.display = "none";
        } else {
            console.log("landPg element is either missing or not visible.");
        }


    }
}

// Fetch hourly temperature + UV from Open-Meteo
async function getOpenMeteoForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,uv_index,wind_speed_10m,weathercode&timezone=auto`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Open-Meteo API Error: ${res.status}`);
        const data = await res.json();

        forecastContainerI.innerHTML = "";  
        forecastContainerII.innerHTML = "";
        forecastContainerIII.innerHTML = "";
        forecastContainerIV.innerHTML = "";
        
        const times = data.hourly.time;
        const temps = data.hourly.temperature_2m;
        const uv = data.hourly.uv_index;
        const wind = data.hourly.wind_speed_10m;
        const weatherCodes = data.hourly.weathercode;

        const now = new Date();
        const currentHour = now.getHours();
        
        // Find the index of the current hour in the forecast
        let startIndex = times.findIndex(time => {
            const dt = new Date(time);
            return dt.getHours() === currentHour;
        });

        // If the current hour isn't found, fallback to the first index
        if (startIndex === -1) {
            startIndex = 0;
        }

        // Loop through the next 24 hours starting from the current hour
        for (let i = startIndex; i < startIndex + 24 && i < times.length; i++) {
            const dt = new Date(times[i]);

            // Time column
            const tdTime = document.createElement("td");
            if (dt.getHours() === now.getHours()) {
                tdTime.textContent = "Now";
            } else {
                tdTime.textContent = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Temp column
            const tdTemp = document.createElement("td");
            tdTemp.textContent = `${temps[i].toFixed()}°C`;

            // Weather icon column
            const tdIcon = document.createElement("td");
            const img = document.createElement("img");
            img.src = getOpenWeatherIcon(weatherCodes[i], dt.getHours());  
            img.alt = "Weather icon";
            img.width = 40;
            tdIcon.appendChild(img);

            // Wind info column
            const windInfo = document.createElement("td");
            windInfo.textContent = `${wind[i]} km/h`;

            forecastContainerI.appendChild(tdTemp);
            forecastContainerII.appendChild(tdIcon);
            forecastContainerIII.appendChild(windInfo);
            forecastContainerIV.appendChild(tdTime);
        }

        // Show UV index for the current hour
        uvDisplay.textContent = `${uv[0]}`;

    } catch (err) {
        console.error("Error fetching Open-Meteo forecast:", err.message);
    }
}


// Map Open-Meteo weather codes to OpenWeather icons
function getOpenWeatherIcon(code, hour) {
    const isNight = hour < 6 || hour >= 18; 
    const prefix = isNight ? "n" : "d"; 

    const map = {
        0: `https://openweathermap.org/img/wn/01${prefix}.png`, // Clear sky
        1: `https://openweathermap.org/img/wn/02${prefix}.png`, // Mainly clear
        2: `https://openweathermap.org/img/wn/03${prefix}.png`, // Partly cloudy
        3: `https://openweathermap.org/img/wn/04${prefix}.png`, // Overcast
        45: `https://openweathermap.org/img/wn/50${prefix}.png`, // Fog
        48: `https://openweathermap.org/img/wn/50${prefix}.png`, // Depositing rime fog
        51: `https://openweathermap.org/img/wn/09${prefix}.png`, // Light drizzle
        53: `https://openweathermap.org/img/wn/09${prefix}.png`, // Moderate drizzle
        55: `https://openweathermap.org/img/wn/09${prefix}.png`, // Dense drizzle
        61: `https://openweathermap.org/img/wn/10${prefix}.png`, // Slight rain
        63: `https://openweathermap.org/img/wn/10${prefix}.png`, // Moderate rain
        65: `https://openweathermap.org/img/wn/10${prefix}.png`, // Heavy rain
        71: `https://openweathermap.org/img/wn/13${prefix}.png`, // Snow fall
        73: `https://openweathermap.org/img/wn/13${prefix}.png`, 
        75: `https://openweathermap.org/img/wn/13${prefix}.png`, 
        95: `https://openweathermap.org/img/wn/11${prefix}.png`, // Thunderstorm
        96: `https://openweathermap.org/img/wn/11${prefix}.png`,
        99: `https://openweathermap.org/img/wn/11${prefix}.png`
    };

    return map[code] || `https://openweathermap.org/img/wn/01${prefix}.png`;
}

// Fetch weather and forecast by city name
const reInfo = document.getElementById('reInfo');
if (reInfo) {
  reInfo.addEventListener('click', () => {
    const city = cty.value.trim();
    if (city) {
        fetchWeatherAndForecast(city);
    } else {
        alert("Please enter a city name!");
    }
});
}

const reInfoI = document.getElementById('reInfoI'); 
if (reInfoI) {
  reInfoI.addEventListener('click', () => {
    const city = ctyI.value.trim();
    if (city) {
        fetchWeatherAndForecast(city);
        if (load) {
            load.style.display = "block";
        }
    } else {
        alert("Please enter a city name!");
    }
});
}
// Fetch weather and forecast using user's geolocation
async function getUserLocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        locaName.textContent = "Geolocation not supported!";
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
      
      localStorage.setItem('userLat', latitude);
      localStorage.setItem('userLon', longitude);

        alert(`Latitude: ${latitude}, Longitude: ${longitude}`);
        fetchWeatherAndForecast(latitude, longitude); // Fetch weather and forecast using coordinates
    } catch (error) {
        console.error(`Failed to get geolocation: ${error.message}`);
         if (load) {
            load.innerHTML = `<p class="text-danger">Location permission denied</p>`;
        }
    }
}

// Add event listener for geolocation button
const getLocation = document.getElementById('location');
if (getLocation) {
  getLocation.addEventListener('click', getUserLocation);
}

const getLocationI = document.getElementById('locationI');
if (getLocationI) {
  getLocationI.addEventListener('click', () => {
    getUserLocation();
    if (load) {
        load.style.display = "block";
    }
});
}

document.addEventListener('DOMContentLoaded', () => { 
  if (latUser && lonUser) {
    fetchWeatherAndForecast(latUser, lonUser); 
  } else {
    console.log("xxxxx");
  }
});

// SETTINGS PAGE
const delDefLocation = document.getElementById('delDefLocation');

if (latUser && lonUser) {
if (delDefLocation) {
  delDefLocation.addEventListener("click", () => {
    localStorage.removeItem('userLat');
    localStorage.removeItem('userLon');
    delDefLocation.disabled = true;
  });
}
} else {
  delDefLocation.disabled = true;
  delDefLocation.removeEventListener("click")
}
  
  
  
  