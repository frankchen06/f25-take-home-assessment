"use client";

//imports
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// BONUS Feature: Added dynamic emojis, background, and text colour based on weather conditions 
const getWeatherStyle = (description: string, temperature: number) => {
  const desc = description.toLowerCase();
  
  let emoji = "🌤️"; //  this is the default emoji
  // check for specific conditions and assign emojis
  if (desc.includes("sunny")) emoji = "☀️";
  else if (desc.includes("rain")) emoji = "🌧️";
  else if (desc.includes("snow")) emoji = "❄️";
  else if (desc.includes("overcast")) emoji = "☁️";
  
  // Background and text color changes based on temperature and conditions
  let bgColor = "bg-blue-100";
  let textColor = "text-blue-700";
  
  if (temperature >= 30) {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  } else if (temperature >= 20) {
    bgColor = "bg-orange-100";
    textColor = "text-orange-700";
  } else if (temperature >= 10) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-700";
  } else if (temperature < 0) {
    bgColor = "bg-cyan-100";
    textColor = "text-cyan-700";
  }
  
  // Special conditions override temperature colors
  if (desc.includes("rain")) {
    bgColor = "bg-blue-200";
    textColor = "text-blue-800";
  } else if (desc.includes("snow")) {
    bgColor = "bg-slate-200";
    textColor = "text-slate-800";
  } else if (desc.includes("sunny")) {
    bgColor = "bg-yellow-200";
    textColor = "text-yellow-800";
  }
  
  return { emoji, bgColor, textColor };
};

// BONUS Feature: Temperature conversion functions
const celsiusToFahrenheit = (celsius: number) => Math.round((celsius * 9/5) + 32);
const formatTemperature = (celsius: number, unit: 'C' | 'F') => {
  if (unit === 'F') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${celsius}°C`;
};

export function WeatherLookup() {
  // Form input state 
  const [searchId, setSearchId] = useState("");

  //Request state indicators
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Temperature unit toggle state
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  // Handle form submission to fetch weather data by ID
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    //Validate input
    if (!searchId.trim()) {
      setError("Please enter an ID");
      return;
    }

    // Reset state
    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // fetch function to GET request to backend
      const response = await fetch(`http://localhost:8000/weather/${searchId.trim()}`);

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else if (response.status === 404) {
        setError("Weather data not found");
      } else {
        setError("Failed to fetch weather data");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // BONUS Feature: Clear form function
  const handleClear = () => {
    setSearchId("");
    setWeatherData(null);
    setError(null);
  };

  // used same style as weather-form.tsx
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
        <CardDescription>
          Enter a unique weather ID to retrieve previously stored data.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-id">Weather ID</Label>
            <div className="flex gap-2">
              <Input
                id="search-id"
                type="text"
                placeholder="Enter weather ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={!searchId && !weatherData}
              >
                Clear
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Lookup Weather Data"}
          </Button>

          {/* Error message box */}
          {error && (
            <div className="p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Temperature Unit Toggle */}
        {weatherData && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
              <Button
                variant={tempUnit === 'C' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTempUnit('C')}
                className="h-7 px-3"
              >
                °C
              </Button>
              <Button
                variant={tempUnit === 'F' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTempUnit('F')}
                className="h-7 px-3"
              >
                °F
              </Button>
            </div>
          </div>
        )}

        {/* Render data from API with dynamic styling */}
        {weatherData && (() => {
          const style = getWeatherStyle(
            weatherData.weather.current.weather_descriptions[0],
            weatherData.weather.current.temperature
          );
          
          return (
            <div className={`mt-4 p-3 rounded-md ${style.bgColor} ${style.textColor} border border-green-500`}>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="text-2xl">{style.emoji}</span>
                Weather data retrieved successfully!
              </p>
              <div className="space-y-1 text-xs">
                <p><strong>Temperature:</strong> {formatTemperature(weatherData.weather.current.temperature, tempUnit)}</p>
                <p><strong>Description:</strong> {weatherData.weather.current.weather_descriptions[0]}</p>
                <p><strong>Location:</strong> {weatherData.weather.location.name}, {weatherData.weather.location.country}</p>
                <p><strong>Feels like:</strong> {formatTemperature(weatherData.weather.current.feelslike, tempUnit)}</p>
                <p><strong>Humidity:</strong> {weatherData.weather.current.humidity}%</p>
              </div>
            </div>
          );
        })()}

      </CardContent>
    </Card>
  );
}
