using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using MyProjectW4.Models;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Umbraco.Cms.Web.Common.Security;

namespace MyProjectW4.Controllers
{
    public class WeatherController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public WeatherController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<IActionResult> Index(string city = "London")
        {
            string apiKey = "2636c1fbccab4bdf98394827251106";
            if (string.IsNullOrWhiteSpace(city))
                return Content("Please enter a valid city name.");

            string url = $"https://api.weatherapi.com/v1/forecast.json?key={apiKey}&q={city}&days=3&lang=sl";
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                return Content("Error fetching weather data. Check your API key or city.");

            string json = await response.Content.ReadAsStringAsync();
            JObject data = JObject.Parse(json);

            var model = new WeatherModel
            {
                City = data["location"]?["name"]?.ToString() ?? "Unknown",
                CurrentDescription = data["current"]?["condition"]?["text"]?.ToString() ?? "No data",
                CurrentTemperature = (double?)data["current"]?["temp_c"] ?? 0,
                CurrentHumidity = (int?)data["current"]?["humidity"] ?? 0,
                CurrentWindSpeed = (double?)data["current"]?["wind_kph"] ?? 0,
                UVIndex = (double?)data["current"]?["uv"] ?? 0,
                CurrentIconUrl = "https:" + data["current"]?["condition"]?["icon"]?.ToString(),
                Forecasts = new List<WeatherModel.DailyForecast>(),
                HourlyForecasts = new List<WeatherModel.HourlyForecast>()
            };

            // Process daily forecast data:
            foreach (var day in data["forecast"]["forecastday"])
            {
                model.Forecasts.Add(new WeatherModel.DailyForecast
                {
                    Date = day["date"]?.ToString() ?? "",
                    Description = day["day"]?["condition"]?["text"]?.ToString() ?? "",
                    Temperature = (double?)day["day"]?["avgtemp_c"] ?? 0,
                    IconUrl = "https:" + day["day"]?["condition"]?["icon"]?.ToString()
                });
            }

            // Process hourly forecast data for the first forecast day:
            var hourlyArray = data["forecast"]?["forecastday"]?[0]?["hour"];
            if (hourlyArray != null)
            {
                foreach (var hourly in hourlyArray)
                {
                    model.HourlyForecasts.Add(new WeatherModel.HourlyForecast
                    {
                        Time = hourly["time"]?.ToString() ?? "",
                        Temperature = (double?)hourly["temp_c"] ?? 0,
                        ChanceOfRain = (double?)hourly["chance_of_rain"] ?? 0
                    });
                }
            }
            else
            {
                // Simulate adding hourly forecast data if API data is absent:
                for (int i = 0; i < 12; i++)
                {
                    model.HourlyForecasts.Add(new WeatherModel.HourlyForecast
                    {
                        Time = DateTime.Now.AddHours(i).ToString("h tt"),
                        Temperature = 25 + i * 0.5,
                        ChanceOfRain = 10 + i
                    });
                }
            }

            return View(model);
        }
    }
}