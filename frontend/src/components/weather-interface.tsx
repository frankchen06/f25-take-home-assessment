"use client";

//imports
import { useState } from "react";
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

export function WeatherLookup() {
  // Form input state 
  const [searchId, setSearchId] = useState("");

  //Request state indicators
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
            <Input
              id="search-id"
              type="text"
              placeholder="Enter weather ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Lookup Weather"}
          </Button>

          {/* Error message box */}
          {error && (
            <div className="p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Render data from API */}
        {weatherData && (
          <div className="mt-4 p-3 rounded-md bg-green-900/20 text-green-500 border border-green-500">
            <p className="text-sm font-medium mb-2">Weather data retrieved successfully!</p>
            <div className="space-y-1 text-xs">
              <p><strong>Temperature:</strong> {weatherData.weather.current.temperature}°C</p>
              <p><strong>Description:</strong> {weatherData.weather.current.weather_descriptions[0]}</p>
              <p><strong>Location:</strong> {weatherData.weather.location.name}, {weatherData.weather.location.country}</p>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
