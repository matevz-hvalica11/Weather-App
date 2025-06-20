document.addEventListener('DOMContentLoaded', function () {
    console.log("site.js loaded.");

    // --- Temperature Unit Toggle ---
    var tempToggleButton = document.getElementById('tempToggleButton');

    function convertTemperature(celsius, toFahrenheit) {
        return toFahrenheit ? (celsius * 9 / 5 + 32).toFixed(1) : parseFloat(celsius).toFixed(1);
    }

    function updateTemperatureDisplay(toFahrenheit) {
        var currentTempElem = document.querySelector('.temp-current');
        var hourlyTempElems = document.querySelectorAll('.temp-hourly');
        var forecastTempElems = document.querySelectorAll('.temp-forecast');

        if (currentTempElem) {
            var celsius = parseFloat(currentTempElem.getAttribute('data-celsius'));
            currentTempElem.textContent = "Temperature: " + convertTemperature(celsius, toFahrenheit) + (toFahrenheit ? " \u00B0F" : " \u00B0C");
        }

        hourlyTempElems.forEach(function (elem) {
            var celsius = parseFloat(elem.getAttribute('data-celsius'));
            elem.textContent = "Temp: " + convertTemperature(celsius, toFahrenheit) + (toFahrenheit ? " \u00B0F" : " \u00B0C");
        });

        forecastTempElems.forEach(function (elem) {
            var celsius = parseFloat(elem.getAttribute('data-celsius'));
            elem.textContent = convertTemperature(celsius, toFahrenheit) + (toFahrenheit ? " \u00B0F" : " \u00B0C");
        });
    }


    var isFahrenheit = localStorage.getItem('tempUnit') === 'F';
    updateTemperatureDisplay(isFahrenheit);

    if (tempToggleButton) {
        tempToggleButton.textContent = isFahrenheit ? "Show \u00B0C" : "Show \u00B0F";
        tempToggleButton.addEventListener('click', function () {
            isFahrenheit = !isFahrenheit;
            localStorage.setItem('tempUnit', isFahrenheit ? 'F' : 'C');
            updateTemperatureDisplay(isFahrenheit);
            tempToggleButton.textContent = isFahrenheit ? "Show \u00B0C" : "Show \u00B0F";
            console.log("Temperature unit switched to:", isFahrenheit ? "Fahrenheit" : "Celsius");
        });
    }

    // --- Clock Update ---
    function updateClock() {
        var clockElem = document.getElementById('clock');
        if (!clockElem) {
            console.warn("Clock element not found.");
            return;
        }
        var now = new Date();
        clockElem.textContent = now.toLocaleTimeString();
    }
    updateClock();
    setInterval(updateClock, 1000);


    // --- Auto-refresh every 5 minutes ---
    setInterval(() => {
        console.log("Auto-refresh triggered at", new Date().toLocaleTimeString());
        location.reload();
    }, 300000);


    // --- Dark Theme Toggle ---
    var themeToggleButton = document.getElementById('themeToggleButton');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            var theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            console.log("Theme switched to:", theme);
        });
    }

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }


    // --- Manual Refresh ---
    var refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            console.log("Manual refresh initiated.");
            location.reload();
        });
    }


    // --- Share Weather Button ---
    var shareButton = document.getElementById('shareButton');

    if (shareButton) {
        shareButton.addEventListener('click', function () {
            console.log("Share button clicked!");

            var locationElem = document.querySelector('.weather-title');
            var tempElem = document.querySelector('.temp-current');
            var descElem = document.querySelector('.weather-description');

            if (!locationElem || !tempElem || !descElem) {
                console.error("Missing weather elements! Ensure 'weather-title', 'temp-current', and 'weather-description' exist in index.cshtml.");
                alert("Error: Missing weather elements!");
                return;
            }

            var location = locationElem.textContent;
            var temperature = tempElem.textContent;
            var description = descElem.textContent;

            var message = `🌦️ **Weather Update for ${location}**\n${temperature}\n${description}\nCheck it out!`;

            if (navigator.share) {
                navigator.share({
                    title: `Weather in ${location}`,
                    text: message,
                    url: window.location.href
                }).then(() => console.log("Weather shared successfully!"))
                    .catch(error => console.error("Error sharing:", error));
            } else {
                navigator.clipboard.writeText(message).then(() => {
                    alert("Weather details copied! Paste it wherever you want to share.");
                    console.log("Weather copied to clipboard.");
                }).catch(error => console.error("Clipboard error:", error));
            }
        });
    }


    // --- Severe Weather Alerts ---
    function checkSevereWeather(description) {
        if (!description) return;

        var severeConditions = ["storm", "extreme", "hurricane", "tornado", "heavy snow", "heatwave", "flood"];
        var lowerDesc = description.toLowerCase();
        var alertBox = document.getElementById("weatherAlert");

        severeConditions.forEach(condition => {
            if (lowerDesc.includes(condition)) {
                alertBox.style.display = "block"; // Show alert box
                alertBox.textContent(`⚠ Severe Weather Alert: ${condition.toUpperCase()} detected! Stay safe.`);
                console.warn(`Severe weather detected: ${condition}`);
            }
        });
    }


    // --- Weather Fetching ---
    function fetchWeatherForLocation(lat, lon, cityName) {
        var apiKey = '3674414d18e24d4db29142118251206';
        var weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3`;

        console.log("✅ Fetching fresh weather data for:", cityName);

        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data || !data.current || !data.forecast) {
                    console.error("API response missing required weather data.");
                    return;
                }

                console.log("✅ API Response:", JSON.stringify(data, null, 2));

                updateWeather(data);
                updateBackground(data.current.condition.text);
                updateForecasts(data);

                // Move map only after weather data loads
                window.map.setView([lat, lon], 10);
                setTimeout(() => {
                    window.map.flyTo({ lat, lon }, 10, { animate: true, duration: 1.5, easeLinearity: 0.5 });
                    console.log(`Map visually moved to: ${cityName} (${lat}, ${lon})`);
                }, 500);
            })
            .catch(error => console.error("Error fetching weather:", error));
    }

    // --- Search form ---
    document.getElementById("searchForm").addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("✅ Search button clicked!");

        var cityName = document.getElementById("searchInput").value.trim();
        if (!cityName) {
            console.error("❌ Error: No city entered!");
            return;
        }

        var apiKey = '3674414d18e24d4db29142118251206';
        var geoUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${cityName}`;

        console.log("Sending API request:", geoUrl);

        fetch(geoUrl)
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.error("❌ No location data returned for city.");
                    return;
                }

                var selectedLocation = data.find(place => place.name.toLowerCase() === cityName.toLowerCase()) || data[0];

                if (!selectedLocation) {
                    console.error("❌ Error: No valid location found in API data.");
                    return;
                }

                var lat = parseFloat(selectedLocation.lat);
                var lon = parseFloat(selectedLocation.lon);

                if (isNaN(lat) || isNaN(lon)) {
                    console.error("❌ Invalid coordinates received:", lat, lon);
                    return;
                }

                console.log(`Selected Location: ${selectedLocation.name}, ${selectedLocation.country}`);
                fetchWeatherForLocation(lat, lon, selectedLocation.name);
            })
            .catch(error => console.error("❌ Error fetching coordinates:", error));
    });


    // --- Interactive Map Setup ---
    if (!window.map) {
        window.map = L.map('weather-map').setView([46.0511, 14.5051], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.map);

        window.map.on('click', function (e) {
            var lat = e.latlng.lat.toFixed(4);
            var lon = e.latlng.lng.toFixed(4);

            console.log("✅ Map Click Detected:", lat, lon);
            fetchWeatherForLocation(lat, lon, `Lat: ${lat}, Lon: ${lon}`);
        });
    }


    // --- Weather UI Update ---
    function updateWeather(data) {
        var cityElem = document.querySelector(".weather-title");
        var tempElem = document.getElementById("temp-current");
        var weatherDescElem = document.querySelector(".weather-description")
        var windSpeedElem = document.getElementById("wind-speed");
        var uvIndexElem = document.getElementById("uv-index");
        var humidityElem = document.getElementById("humidity");
        var precipitationElem = document.getElementById("precipitation");

        if (!cityElem || !tempElem || !weatherDescElem || !windSpeedElem || !uvIndexElem || !humidityElem || !precipitationElem) {
            console.warn("❌ Weather elements missing in DOM. Skipping update");
            return;
        }

        cityElem.textContent = data.location.name;
        tempElem.textContent = `${data.current.temp_c} \u00B0C`;
        weatherDescElem.textContent = data.current.condition.text;
        windSpeedElem.textContent = `💨 Wind Speed: ${data.current.wind_kph} km/h`;
        uvIndexElem.textContent = `☀️ UV Index: ${data.current.uv}`;
        humidityElem.textContent = `💧 Humidity: ${data.current.humidity} %`;
        precipitationElem.textContent = `🌧 Precipitation: ${data.current.precip_mm}`;

        console.log("✅ Weather successfully updated!");
    }


    // --- Forecast UI Update ---
    function updateForecasts(data) {
        var hourlyForecastElem = document.getElementById("hourly-forecast");
        var dailyForecastElem = document.getElementById("daily-forecast");

        if (!hourlyForecastElem || !dailyForecastElem) {
            console.error("❌ Error: Forecast elements missing in DOM.");
            return;
        }


        // Clear previous forecast data
        hourlyForecastElem.innerHTML = "";
        dailyForecastElem.innerHTML = "";


        // Insert updated hourly forecast dynamically
        data.forecast.forecastday[0].hour.forEach((hourData) => {
            var hourBlock = document.createElement("div");
            hourBlock.classList.add("hourly-card");
            hourBlock.innerHTML = `
                <p>${new Date(hourData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p class="temp-hourly">${hourData.temp_c}°C</p>
                <p> Rain: ${hourData.chance_of_rain}%</p>
            `;
            hourlyForecastElem.appendChild(hourBlock);
        });


        // Insert updated 3-day forecast dynamically
        data.forecast.forecastday.forEach((forecast) => {
            var forecastBlock = document.createElement("div");
            forecastBlock.classList.add("forecast-card");
            forecastBlock.innerHTML = `
                <h4>${new Date(forecast.date).toLocaleDateString()}</h4>
                <p>${forecast.day.condition.text}</p>
                <p class="temp-forecast">${forecast.day.avgtemp_c}°C</p>
                <p> Rain Chance: ${forecast.day.daily_chance_of_rain}%</p>
            `;
            dailyForecastElem.appendChild(forecastBlock);
        });

        console.log("✅ Hourly & 3-day forecast updated dynamically!");
    }


    // --- Dynamic Background ---
    function updateBackground(weatherCondition) {
        var body = document.body;
        body.className = "";

        if (weatherCondition.includes("rain") || weatherCondition.includes("drizzle")) {
            body.classList.add("rainy-bg");
        } else if (weatherCondition.includes("clear") || weatherCondition.includes("sunny")) {
            body.classList.add("sunny-bg");
        } else if (weatherCondition.includes("cloud")) {
            body.classList.add("cloudy-bg");
        } else if (weatherCondition.includes("fog") || weatherCondition.includes("mist")) {
            body.classList.add("foggy-bg");
        } else if (weatherCondition.includes("snow")) {
            body.classList.add("snowy-bg");
        } else {
            body.classList.add("default-bg");
        }

        console.log("✅ Background updated dynamically:", weatherCondition);
    }


    // --- AOS Initialization ---
    if (typeof AOS !== 'undefined') {
        AOS.init();
        console.log("✅ AOS initialized successfully.");
    } else {
        console.error("✅ AOS library is missing. Make sure it's included.");
    }

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(function (reg) { console.log('Service Worker registered with scope:', reg.scope); })
            .catch(function (error) {
                console.error('❌ Service Worker registration failed:', error);
            });
    }
});
