using System.Collections.Generic;

namespace MyWeatherApp_Deployed.Models
{
    public class WeatherModel
    {
        public string CityName { get; set; } = string.Empty;
        public string TempUnit { get; set; } = "C";
        public string CurrentCondition { get; set; } = string.Empty;
        public double CurrentTemperature { get; set; }
        public int CurrentHumidity { get; set; }
        public double CurrentWindSpeed { get; set; }
        public double FeelsLikeTemperature { get; set; }
        public double CurrentPrecipitation { get; set; }
        public double UVIndex { get; set; }
        public string CurrentIcon { get; set; } = string.Empty;
        public string CurrentIconUrl { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public List<DailyForecast> Forecasts { get; set; } = new();
        public List<HourlyForecast> Hourly { get; set; } = new();

        public string FeelsLike => $"{FeelsLikeTemperature:0#}";
        public string WindSpeed => $"{CurrentWindSpeed:0.#}";
        public string Humidity => $"{CurrentHumidity}";
        public string UV => $"{UVIndex:0.#}";
        public string CurrentTemp => $"{CurrentTemperature:0.#}";

        public string CurrentIconClass
        {
            get
            {
                var lower = CurrentCondition?.ToLower() ?? "";
                if (lower.Contains("clear") || lower.Contains("sunny")) return "wi-day-sunny";
                if (lower.Contains("cloud") || lower.Contains("overcast")) return "wi-cloudy";
                if (lower.Contains("rain") || lower.Contains("drizzle")) return "wi-rain";
                if (lower.Contains("thunder")) return "wi-thunderstorm";
                if (lower.Contains("snow")) return "wi-snow";
                if (lower.Contains("mist") || lower.Contains("fog")) return "wi-fog";
                return "wi-na";
            }
        }

        public class DailyForecast
        {
            public string Date { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public double MaxTemp { get; set; }
            public double MinTemp { get; set; }

            public string IconClass => new WeatherModel().GetWeatherIcon(Description);
        }

        public class HourlyForecast
        {
            public string Time { get; set; } = string.Empty;
            public double Temperature { get; set; }
            public string Condition { get; set; } = string.Empty;

            public string Temp => $"{Temperature:0.#}";
            public string IconClass => new WeatherModel().GetWeatherIcon(Condition);
        }


        public string GetWeatherIcon(string condition)
        {
            var lower = condition?.ToLower() ?? "";

            if (lower.Contains("clear") || lower.Contains("sunny")) return "wi wi-day-sunny";
            if (lower.Contains("partly") && lower.Contains("cloud")) return "wi wi-day-cloudy";
            if (lower.Contains("cloud") || lower.Contains("overcast")) return "wi wi-cloudy";
            if (lower.Contains("rain") || lower.Contains("drizzle")) return "wi wi-rain";
            if (lower.Contains("thunder") || lower.Contains("storm")) return "wi wi-thunderstorm";
            if (lower.Contains("snow") || lower.Contains("sleet")) return "wi wi-snow";
            if (lower.Contains("fog") || lower.Contains("mist") || lower.Contains("haze")) return "wi wi-fog";
            if (lower.Contains("wind")) return "wi wi-strong-wind";

            return "wi wi-na";
        }
    }
}
