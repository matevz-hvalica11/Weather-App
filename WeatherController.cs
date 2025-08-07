using Microsoft.AspNetCore.Mvc;
using MyWeatherApp_Deployed.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Threading.Tasks;

namespace MyWeatherApp_Deployed.Controllers
{
    public class WeatherController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public WeatherController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<IActionResult> Index(string city = "", double? lat = null, double? lon = null, string unit = "C")
        {
            string apiKey = "f9e6be0f1de4492ea8c95632252506";

            string query = !string.IsNullOrWhiteSpace(city)
                ? city
                : (lat.HasValue && lon.HasValue)
                    ? $"{lat.Value.ToString(CultureInfo.InvariantCulture)},{lon.Value.ToString(CultureInfo.InvariantCulture)}"
                    : "New York"; 

            string url = $"https://api.weatherapi.com/v1/forecast.json?key={apiKey}&q={query}&days=3&lang=sl";

            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return Content("Error fetching weather data. Check your API key or location.");

            string json = await response.Content.ReadAsStringAsync();
            JObject data = JObject.Parse(json);

            var model = new WeatherModel
            {
                CityName = data["location"]?["name"]?.ToString() ?? "Unknown",
                CurrentCondition = data["current"]?["condition"]?["text"]?.ToString() ?? "",
                CurrentTemperature = (double?)data["current"]?[unit == "F" ? "temp_f" : "temp_c"] ?? 0,
                FeelsLikeTemperature = (double?)data["current"]?[unit == "F" ? "temp_f" : "temp_c"] ?? 0,
                CurrentHumidity = (int?)data["current"]?["humidity"] ?? 0,
                CurrentWindSpeed = (double?)data["current"]?["wind_kph"] ?? 0,
                UVIndex = (double?)data["current"]?["uv"] ?? 0,
                CurrentIconUrl = "https:" + data["current"]?["condition"]?["icon"]?.ToString(),
                TempUnit = unit == "F" ? "F" : "C",
                Forecasts = new(),
                Hourly = new()
            };


            // Hourly Forecast
            var hourlyArray = data["forecast"]?["forecastday"]?[0]?["hour"];
            if (hourlyArray != null)
            {
                foreach (var hour in hourlyArray)
                {
                    model.Hourly.Add(new WeatherModel.HourlyForecast
                    {
                        Time = hour["time"]?.ToString() ?? "",
                        Temperature = (double?)hour[unit == "F" ? "temp_f" : "temp_c"] ?? 0,
                        Condition = hour["condition"]?["text"]?.ToString() ?? ""
                    });
                }
            }

            // Daily Forecasts
            foreach (var day in data["forecast"]?["forecastday"] ?? new JArray())
            {
                model.Forecasts.Add(new WeatherModel.DailyForecast
                {
                    Date = day["date"]?.ToString() ?? "",
                    Description = day["day"]?["condition"]?["text"]?.ToString() ?? "",
                    MaxTemp = (double?)day["day"]?[unit == "F" ? "maxtemp_f" : "maxtemp_c"] ?? 0,
                    MinTemp = (double?)day["day"]?[unit == "F" ? "mintemp_f" : "mintemp_c"] ?? 0
                });
            }

            // Leaflet.js
            model.Latitude = (double?)data["location"]?["lat"] ?? 0;
            model.Longitude = (double?)data["location"]?["lon"] ?? 0;


            return View(model);
        }
    }
}
