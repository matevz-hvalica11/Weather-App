using System.Collections.Generic;
using Umbraco.Cms.Core.Media.EmbedProviders;
using System;
using System.Linq;

namespace MyProjectW4.Models
{
    public class WeatherModel
    {
        // Base weather properties with default values
        public string City { get; set; } = string.Empty;
        public string CurrentDescription { get; set; } = string.Empty;
        public double CurrentTemperature { get; set; }
        public int CurrentHumidity { get; set; }
        public double CurrentWindSpeed { get; set; }
        public double FeelsLikeTemperature { get; set; }
        public double CurrentPrecipitation { get; set; }
        public double UVIndex { get; set; }
        public string CurrentIcon { get; set; } = string.Empty;
        public string CurrentIconUrl { get; set; } = string.Empty;

        // Lists for daily and hourly forecasts; initialized here so they are never null.
        public List<DailyForecast> Forecasts dotnet{ get; set; } = new List<DailyForecast>();
        public List<HourlyForecast> HourlyForecasts { get; set; } = new List<HourlyForecast>();


        public string CurrentIconClass
        {
            get
            {
                var lower = CurrentDescription?.ToLower() ?? "";
                if (lower.Contains("clear") || lower.Contains("sunny")) return "wi-day-sunny";
                if (lower.Contains("cloud") || lower.Contains("overcast")) return "wi-cloudy";
                if (lower.Contains("rain") || lower.Contains("drizzle")) return "wi-rain";
                if (lower.Contains("thunder")) return "wi-thunderstorm";
                if (lower.Contains("snow")) return "wi-snow";
                if (lower.Contains("mist") || lower.Contains("fog")) return "wi-fog";
                return "wi-na";
            }
        }

        public string GetWeatherIcon(string condition)
        {
            if (string.IsNullOrWhiteSpace(condition)) return "wi-na";

            var lowerCondition = condition.ToLower();
            return lowerCondition switch
            {
                "sunny" => "wi-day-sunny",
                "cloudy" => "wi-cloudy",
                "partly cloudy" => "wi-day-cloudy",
                "rain" => "wi-rain",
                "thunderstorm" => "wi-thunderstorm",
                "snow" => "wi-snow",
                "fog" => "wi-fog",
                "mist" => "wi-fog",
                "windy" => "wi-strong-wind",
                _ => "wi-na"
            };
        }

        // Nested class for daily forecast data
        public class DailyForecast
        {
            public string Date { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public double Temperature { get; set; }
            public string IconUrl { get; set; } = string.Empty;

            public string IconClass
            {
                get
                {
                    var lower = Description?.ToLower() ?? "";
                    if (lower.Contains("clear") || lower.Contains("sunny")) return "wi-day-sunny";
                    if (lower.Contains("cloud") || lower.Contains("overcast")) return "wi-cloudy";
                    if (lower.Contains("rain") || lower.Contains("drizzle")) return "wi-rain";
                    if (lower.Contains("thunder")) return "wi-thunderstorm";
                    if (lower.Contains("snow")) return "wi-snow";
                    if (lower.Contains("mist") || lower.Contains("fog")) return "wi-fog";
                    return "wi-na";
                }
            }
        }

        // Nested class for hourly forecast data
        public class HourlyForecast
        {
            // Initialize 'Time' to an empty string to avoid nullability warnings. 
            public string Time { get; set; } = string.Empty;
            public double Temperature { get; set; }
            public double ChanceOfRain { get; set; }
            public string Condition { get; set; } = string.Empty;
        }
    }
}