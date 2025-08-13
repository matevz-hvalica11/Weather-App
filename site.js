// site.js
document.addEventListener('DOMContentLoaded', function () {
    console.log("✅ site.js loaded");

    // --- Constants ---
    const BG_CLASSES = ["default-bg", "sunny-bg", "rainy-bg", "cloudy-bg", "foggy-bg", "snowy-bg"];
    const tempToggleButton = document.getElementById('tempToggleButton');
    const themeToggleButton = document.getElementById("themeToggleButton");
    const refreshButton = document.getElementById("refreshButton");
    const shareButton = document.getElementById("shareButton");
    const clockElem = document.getElementById("clock");
    const overlay = document.getElementById("weather-overlay");
    const citySelect = document.getElementById("citySelect");
    let mapTileLayer;

    // --- Helpers: Weather condition source ---
    function getConditionText() {
        // Try a few likely places
        const el1 = document.querySelector("#weather-condition");
        const el2 = document.querySelector(".weather-description");
        const text = (el1?.textContent || el2?.textContent || "").trim();
        return text;
    }

    // Map condition text -> one of our known background classes
    function mapConditionToClass(desc) {
        const lower = desc.toLowerCase();

        // Keep mapping within available classes
        if (lower.includes("clear") || lower.includes("sunny")) return "sunny-bg";
        if (lower.includes("thunder") || lower.includes("storm")) return "rainy-bg";
        if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("shower")) return "rainy-bg";
        if (lower.includes("snow") || lower.includes("sleet") || lower.includes("blizzard")) return "snowy-bg";
        if (lower.includes("fog") || lower.includes("mist") || lower.includes("haze") || lower.includes("smoke")) return "foggy-bg";
        if (lower.includes("cloud") || lower.includes("overcast")) return "cloudy-bg";
        return "default-bg";
    }

    function clearWeatherBackgrounds() {
        document.body.classList.remove(...BG_CLASSES);
        document.documentElement.classList.remove(...BG_CLASSES);
    }

    function applyWeatherBackground(desc) {
        // Only in light mode
        if (!desc) return;
        if (document.body.classList.contains("dark-mode")) return;

        clearWeatherBackgrounds();
        const bgClass = mapConditionToClass(desc);
        document.body.classList.add(bgClass);
        document.documentElement.classList.add(bgClass);
        console.log(`🌤️ Background set: ${bgClass} (from "${desc}")`);
    }

    function applyWeatherOverlay(desc) {
        if (!overlay) return;
        if (!desc) return;
        if (document.body.classList.contains("dark-mode")) {
            overlay.className = "";
            return;
        }

        const lower = desc.toLowerCase();
        overlay.className = ""; // reset overlay effects

        if (lower.includes("fog") || lower.includes("mist") || lower.includes("haze") || lower.includes("smoke")) {
            overlay.classList.add("fog-effect");
        } else if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("shower")) {
            overlay.classList.add("rain-effect");
        } else if (lower.includes("snow") || lower.includes("sleet")) {
            overlay.classList.add("snow-effect");
        } else if (lower.includes("clear") || lower.includes("sunny")) {
            overlay.classList.add("sunray-effect");
        }
    }

    function getAqiColor(index) {
        if (index === 1) return "green";
        if (index === 2) return "yellow";
        if (index === 3) return "orange";
        if (index === 4) return "red";
        if (index === 5) return "purple";
        if (index === 6) return "maroon";
        return "inherit";
    }

    function updateExtraMetrics() {
        const tempUnit = localStorage.getItem("tempUnit") || "C";

        const tempEl = document.getElementById('tempValue');
        const dewEl = document.getElementById('dewPointValue');
        const precipEl = document.getElementById('precipValue');
        const aqiEl = document.getElementById('airQualityValue');

        if (tempEl) {
            tempEl.textContent = `${tempEl.dataset[tempUnit.toLowerCase()]} °${tempUnit}`;
        }
        if (dewEl) {
            dewEl.textContent = `${dewEl.dataset[tempUnit.toLowerCase()]} °${tempUnit}`;
        }
        if (precipEl) {
            precipEl.textContent = `${precipEl.dataset[tempUnit === "C" ? "mm" : "in"]} ${tempUnit === "C" ? "mm" : "in"}`;
        }
        if (aqiEl) {
            const index = parseInt(aqiEl.dataset.index, 10);
            aqiEl.style.color = getAqiColor(index);
        }
    }


    // Note: Previously this overwrote the body's background.
    // If you want gradients, apply them via CSS classes instead of inline styles.
    function applyTimeGradient() {
        // Intentionally no-op to avoid overriding weather backgrounds.
        // Keep for future: move to CSS classes like .time-morning, etc.
    }

    function applyWeatherUI() {
        const desc = getConditionText();
        applyWeatherBackground(desc);
        applyWeatherOverlay(desc);
        updateExtraMetrics();
        // applyTimeGradient(); // disabled to protect background images
    }

    // --- Theme: setup & toggle ---
    function setThemeFromStorage() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.body.classList.toggle("dark-mode", savedTheme === "dark");
        document.documentElement.classList.toggle("dark-mode", savedTheme === "dark");

        if (savedTheme === "dark") {
            clearWeatherBackgrounds();
            if (overlay) overlay.className = "";
        } else {
            applyWeatherUI();
        }
        console.log("🌗 Theme on load:", savedTheme);
    }

    function toggleTheme() {
        const willBeDark = !document.body.classList.contains("dark-mode");
        document.body.classList.toggle("dark-mode", willBeDark);
        document.documentElement.classList.toggle("dark-mode", willBeDark);
        localStorage.setItem("theme", willBeDark ? "dark" : "light");
        console.log("🌗 Theme:", willBeDark ? "dark" : "light");

        if (willBeDark) {
            clearWeatherBackgrounds();
            if (overlay) overlay.className = "";
        } else {
            applyWeatherUI();
        }

        // Update map tiles dynamically
        if (window.map && mapTileLayer) {
            window.map.removeLayer(mapTileLayer);
            mapTileLayer = createTileLayer();
            mapTileLayer.addTo(window.map);
        }
    }


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

    function toggleTempUnit() {
        const currentUnit = localStorage.getItem("tempUnit") || "C";
        const newUnit = currentUnit === "C" ? "F" : "C";
        localStorage.setItem("tempUnit", newUnit);
        updateExtraMetrics();
        tempToggleButton.textContent = newUnit === "F" ? "Show °C" : "Show °F";
    }

    setThemeFromStorage();
    updateExtraMetrics();

    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", toggleTheme);
    }

    if (tempToggleButton) {
        tempToggleButton.addEventListener("click", toggleTempUnit);
        tempToggleButton.textContent =
            (localStorage.getItem("tempUnit") || "C") === "F" ? "Show °C" : "Show °F";
    }

    // Re-apply UI once everything is fully loaded (in case content hydrates late)
    window.addEventListener("load", applyWeatherUI);

    // Optional: Re-apply if the condition text changes dynamically
    const conditionEl = document.querySelector("#weather-condition, .weather-description");
    if (conditionEl && window.MutationObserver) {
        const mo = new MutationObserver(() => applyWeatherUI());
        mo.observe(conditionEl, { childList: true, subtree: true, characterData: true });
    }


    // --- Manual Refresh ---
    if (refreshButton) {
        refreshButton.addEventListener("click", () => {
            console.log("🔄 Manual refresh");
            location.reload();
        });
    }

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
        console.log("🗺️ Initial map tiles loaded");

        // Delay moving the map until DOM is fully ready
        setTimeout(() => {
            const latElem = document.getElementById("mapLat");
            const lonElem = document.getElementById("mapLon");
            if (latElem && lonElem) {
                const lat = parseFloat(latElem.value);
                const lon = parseFloat(lonElem.value);
                if (!isNaN(lat) && !isNaN(lon)) {
                    window.map.setView([lat, lon], 10);
                    console.log(`🧭 Map moved to: ${lat}, ${lon}`);
                }
            }
        }, 250);

        // Click to fetch weather
        window.map.on("click", function (e) {
            const lat = e.latlng.lat.toFixed(4);
            const lon = e.latlng.lng.toFixed(4);
            const unit = localStorage.getItem("tempUnit") || "C";
            window.location.href = `/Weather/Index?lat=${lat}&lon=${lon}&unit=${unit}`;
        });
    }

    // --- Severe Weather Alerts ---
    function checkSevereWeather(desc) {
        const alertBox = document.getElementById("weatherAlert");
        if (!alertBox || !desc) return;

        const severe = ["storm", "extreme", "hurricane", "tornado", "heavy snow", "heatwave", "flood"];
        const lower = desc.toLowerCase();
        const match = severe.find(word => lower.includes(word));
        if (match) {
            alertBox.style.display = "block";
            alertBox.textContent = `⚠️ SEVERE WEATHER: ${match.toUpperCase()} detected. Stay safe!`;
            console.warn("🚨 Alert:", match);
        } else {
            alertBox.style.display = "none";
        }
    }
    checkSevereWeather(getConditionText());
});
