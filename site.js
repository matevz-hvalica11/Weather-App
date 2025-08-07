document.addEventListener('DOMContentLoaded', function () {
    console.log("✅ site.js loaded");


    // --- Constants ---
    const bgClasses = ["default-bg", "sunny-bg", "rainy-bg", "cloudy-bg", "foggy-bg", "snowy-bg"];
    const tempToggleButton = document.getElementById('tempToggleButton');
    const themeToggleButton = document.getElementById("themeToggleButton");
    const refreshButton = document.getElementById("refreshButton");
    const shareButton = document.getElementById("shareButton");
    const conditionText = document.querySelector("#weather-condition")?.textContent || "";
    const clockElem = document.getElementById("clock");

    let mapTileLayer;


    // --- Temp Toggle: reloads page with new unit ---
    if (tempToggleButton) {
        const currentUnit = new URLSearchParams(window.location.search).get("unit") || "C";
        const newUnit = currentUnit === "C" ? "F" : "C";

        tempToggleButton.textContent = currentUnit === "F" ? "Show °C" : "Show °F";

        tempToggleButton.addEventListener("click", () => {
            localStorage.setItem("tempUnit", newUnit);
            const url = new URL(window.location.href);
            url.searchParams.set("unit", newUnit);
            window.location.href = url.toString(); // Reload with new unit
        });
    }


    // --- Theme Toggle ---
    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", () => {
            document.body.classList.remove(...bgClasses);
            document.body.classList.toggle("dark-mode");
            const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
            localStorage.setItem("theme", theme);
            console.log("🌗 Theme:", theme);

            // Update map tiles dynamically
            if (window.map && mapTileLayer) {
                window.map.removeLayer(mapTileLayer);
                mapTileLayer = createTileLayer();
                mapTileLayer.addTo(window.map);
            }
        });
    }


    // --- Apply saved theme on load ---
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.remove(...bgClasses);
        document.body.classList.add("dark-mode");
        applyWeatherBackground(conditionText);
        applyTimeGradient();
    } else {
        applyWeatherBackground(conditionText);
    }


    // --- Apply weather background ---
    function applyWeatherBackground(desc) {
        if (!desc || document.body.classList.contains("dark-mode")) return;
        document.body.classList.remove(...bgClasses);
        const lower = desc.toLowerCase();
        if (lower.includes("clear") || lower.includes("sunny")) document.body.classList.add("sunny-bg");
        else if (lower.includes("cloud")) document.body.classList.add("cloudy-bg");
        else if (lower.includes("rain") || lower.includes("drizzle")) document.body.classList.add("rainy-bg");
        else if (lower.includes("fog") || lower.includes("mist")) document.body.classList.add("foggy-bg");
        else if (lower.includes("snow")) document.body.classList.add("snowy-bg");
        else document.body.classList.add("default-bg");
    }


    // --- Daylight Flow Transitions ---
    function applyTimeGradient() {
        if (document.body.classList.contains("dark-mode")) return; // Respect dark mode

        const hour = new Date().getHours();
        let gradient;

        if (hour >= 6 && hour < 12) {
            gradient = 'linear-gradient(to top, #FFEFBA, #FFFFFF)'; // Morning
        } else if (hour >= 12 && hour < 18) {
            gradient = 'linear-gradient(to top, #3498db, #FFFFFF)'; // Day
        } else if (hour >= 18 && hour < 21) {
            gradient = 'linear-gradient(to top, #FFD194, #D1913C)'; // Sunset
        } else {
            gradient = 'linear-gradient(to top, #2c3e50, #000000)'; // Night
        }

        document.body.style.background = gradient;
        console.log("⏰ Time-based gradient applied:", gradient);
    }


    // --- Weather Overlay ---
    function applyWeatherOverlay(desc) {
        const overlay = document.getElementById("weather-overlay");
        if (!overlay || document.body.classList.contains("dark-mode")) return;

        const lower = desc.toLowerCase();
        overlay.className = ""; // reset

        if (lower.includes("fog") || lower.includes("mist")) overlay.classList.add("fog-effect");
        else if (lower.includes("rain") || lower.includes("drizzle")) overlay.classList.add("rain-effect");
        else if (lower.includes("snow")) overlay.classList.add("snow-effect");
        else if (lower.includes("clear") || lower.includes("sunny")) overlay.classList.add("sunray-effect");

        applyWeatherOverlay(conditionText);
    } 


    // --- Manual Refresh ---
    refreshButton?.addEventListener("click", () => {
        console.log("🔄 Manual refresh");
        location.reload();
    });


    // --- Clock ---
    function updateClock() {
        if (!clockElem) return;
        clockElem.textContent = new Date().toLocaleTimeString();
    }
    updateClock();
    setInterval(updateClock, 1000);


    // --- Auto Refresh every 5 min ---
    setInterval(() => {
        console.log("🔁 Auto-refreshing");
        location.reload();
    }, 5 * 60 * 1000);


    // --- Search Dropdown Behavior ---
    const citySelect = document.getElementById("citySelect");

    if (citySelect) {
        citySelect.addEventListener("change", function () {
            const selectedCity = this.value;
            if (!selectedCity) return;

            const unit = localStorage.getItem("tempUnit") || "C";
            const url = new URL(window.location.href);
            url.pathname = "/Weather/Index";
            url.searchParams.set("city", selectedCity);
            url.searchParams.set("unit", unit);
            window.location.href = url.toString();
        });
    }


    // --- Create Theme-Aware Tile Layer ---
    function createTileLayer() {
        const isDark = document.body.classList.contains("dark-mode");

        const tileLayerUrl = isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        return L.tileLayer(tileLayerUrl, {
            attribution: isDark
                ? '&copy; <a href="https://carto.com/">CartoDB</a>'
                : '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            subdomains: isDark ? "abcd" : "abc",
            maxZoom: 19
        });
    }


    // --- Map Setup ---
    if (!window.map && document.getElementById("weather-map")) {
        window.map = L.map("weather-map").setView([46.05, 14.51], 8);

        // Use theme-aware tile layer
        mapTileLayer = createTileLayer();
        mapTileLayer.addTo(window.map);
        console.log("Initial map tiles loaded");

        // Delay moving the map until DOM is fully ready
        setTimeout(() => {
            const latElem = document.getElementById("mapLat");
            const lonElem = document.getElementById("mapLon");
            if (latElem && lonElem) {
                const lat = parseFloat(latElem.value);
                const lon = parseFloat(lonElem.value);
                if (!isNaN(lat) && !isNaN(lon)) {
                    window.map.setView([lat, lon], 10);
                    console.log(`Map moved to: ${lat}, ${lon}`);
                }
            }
        }, 250); //Delay ensures map renders before moving

        // Click to fetch weather
        window.map.on("click", function (e) {
            const lat = e.latlng.lat.toFixed(4);
            const lon = e.latlng.lng.toFixed(4);
            const unit = localStorage.getItem("tempUnit") || "C";
            window.location.href = `/Weather/Index?lat=${lat}&lon=${lon}&unit=${unit}`;
        });
    }


    // --- Share Weather ---
    if (shareButton) {
        shareButton.addEventListener("click", () => {
            const title = document.querySelector(".weather-title")?.textContent || "";
            const temp = document.querySelector(".temp-current")?.textContent || "";
            const desc = document.querySelector(".weather-description")?.textContent || "";
            const msg = `🌦️ Weather in ${title}:\n${temp}\n${desc}`;

            if (navigator.share) {
                navigator.share({ title, text: msg, url: window.location.href })
                    .then(() => console.log("✅ Shared"))
                    .catch(err => console.warn("❌ Share failed:", err));
            } else {
                navigator.clipboard.writeText(msg)
                    .then(() => alert("✅ Copied to clipboard"))
                    .catch(() => alert("❌ Clipboard failed"));
            }
        });
    }


    // --- Severe Weather Alerts ---
    function checkSevereWeather(desc) {
        const alertBox = document.getElementById("weatherAlert");
        if (!alertBox || !desc) return;

        const severe = ["storm", "extreme", "hurricane", "tornado", "heavy snow", "heatwave", "flood"];
        const match = severe.find(word => desc.toLowerCase().includes(word));
        if (match) {
            alertBox.style.display = "block";
            alertBox.textContent = `⚠️ SEVERE WEATHER: ${match.toUpperCase()} detected. Stay safe!`;
            console.warn("🚨 Alert:", match);
        }
    }
    checkSevereWeather(conditionText);
});
