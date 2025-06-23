from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn   
import os
import secrets
import requests
from dotenv import load_dotenv

app = FastAPI(title="Weather Data System", version="1.0.0")

load_dotenv()
WEATHERSTACK_API_KEY = os.environ.get("WEATHERSTACK_API_KEY") # Get API key from the .env in the backend directory

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    
    # First did some error handling below for validaing input and if the API key is set 
    if not WEATHERSTACK_API_KEY:
        raise HTTPException(status_code=500, detail="WeatherStack API key not configured") 

    if not request.date or not request.location:
        raise HTTPException(status_code=400, detail="Missing date/location in request") 
    
    #Code below calls the API and error handles accordingly 
    api_params = {
        "access_key": WEATHERSTACK_API_KEY,
        "query": request.location,
    }
    try:
        api_response = requests.get("http://api.weatherstack.com/current", params=api_params, timeout = 5)
        api_data = api_response.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to contact API")

    if "error" in api_data:
        raise HTTPException(status_code=400, detail="Invalid location/API error")
    
    # Store data with a unqiue ID by using secrets
    entry_id = secrets.token_urlsafe(12)

    weather_storage[entry_id] = {
        "date": request.date,
        "location": request.location,
        "notes": request.notes,
        "weather": api_data,
    }
    # Return ID to frontend
    return WeatherResponse(id=entry_id)


@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
