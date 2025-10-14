"use client"

import { MonitorPanel } from "./monitor-panel"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  rainChance: number
  weatherCode: number
  location: string
}

interface LocationData {
  latitude: number
  longitude: number
  city: string
  state: string
}

export function WeatherPanel() {
  const { user } = useAuth()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchUserLocationAndWeather()
    }
  }, [user])

  const fetchUserLocationAndWeather = async () => {
    if (!user?.id) return

    try {
      console.log("🌍 [WeatherPanel] Fetching location for user:", user.id)

      // Get user's most recent trip with route replay data
      const { data: routeReplays, error: routeError } = await supabase
        .from("route_replays")
        .select("coordinates")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      let lat = 40.7128 // NYC default
      let lon = -74.0060
      let city = "New York"
      let state = "NY"

      if (routeError) {
        console.error("❌ [WeatherPanel] Error fetching route replays:", routeError)
      } else if (routeReplays && routeReplays.length > 0) {
        try {
          // Parse the coordinates JSON from the first trip
          const coordinates = JSON.parse(routeReplays[0].coordinates)
          if (coordinates && coordinates.length > 0) {
            // Get the first coordinate from the trip
            lat = coordinates[0].latitude
            lon = coordinates[0].longitude
            console.log("📍 [WeatherPanel] Got location from iOS app trip:", lat, lon)

            // Reverse geocode to get city and state
            try {
              const geocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
              )
              const geocodeData = await geocodeResponse.json()
              
              if (geocodeData.address) {
                city = geocodeData.address.city || geocodeData.address.town || geocodeData.address.village || "Unknown"
                state = geocodeData.address.state || ""
                console.log("🏙️ [WeatherPanel] Reverse geocoded to:", city, state)
              }
            } catch (geocodeError) {
              console.error("❌ [WeatherPanel] Reverse geocoding failed:", geocodeError)
            }
          }
        } catch (parseError) {
          console.error("❌ [WeatherPanel] Failed to parse coordinates:", parseError)
        }
      } else {
        console.log("ℹ️ [WeatherPanel] No trips found, using default location")
      }

      setLocation({ latitude: lat, longitude: lon, city, state })

      // Fetch weather from Open-Meteo API (free, no key needed!)
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
      )

      const weatherData = await weatherResponse.json()
      console.log("🌤️ [WeatherPanel] Weather data:", weatherData)

      if (weatherData.current) {
        setWeather({
          temperature: Math.round(weatherData.current.temperature_2m),
          feelsLike: Math.round(weatherData.current.apparent_temperature),
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          windDirection: weatherData.current.wind_direction_10m,
          rainChance: weatherData.current.precipitation_probability || 0,
          weatherCode: weatherData.current.weather_code,
          location: `${city}, ${state}`
        })
      }
    } catch (error) {
      console.error("❌ [WeatherPanel] Error fetching weather:", error)
    } finally {
      setLoading(false)
    }
  }

  // Weather code to emoji and description
  const getWeatherInfo = (code: number) => {
    if (code === 0) return { emoji: "☀️", desc: "CLEAR", color: "text-yellow-500" }
    if (code <= 3) return { emoji: "⛅", desc: "PARTLY CLOUDY", color: "text-blue-400" }
    if (code <= 48) return { emoji: "🌫️", desc: "FOGGY", color: "text-gray-400" }
    if (code <= 67) return { emoji: "🌧️", desc: "RAINY", color: "text-blue-500" }
    if (code <= 77) return { emoji: "🌨️", desc: "SNOWY", color: "text-blue-300" }
    if (code <= 82) return { emoji: "🌧️", desc: "SHOWERS", color: "text-blue-500" }
    if (code <= 86) return { emoji: "🌨️", desc: "SNOW SHOWERS", color: "text-blue-300" }
    if (code <= 99) return { emoji: "⛈️", desc: "THUNDERSTORM", color: "text-purple-500" }
    return { emoji: "🌤️", desc: "MIXED", color: "text-gray-400" }
  }

  // Get wind direction
  const getWindDirection = (degrees: number) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return dirs[Math.round(degrees / 45) % 8]
  }

  // Get track status
  const getTrackStatus = () => {
    if (!weather) return { status: "UNKNOWN", color: "text-gray-500", bgColor: "bg-gray-500" }
    if (weather.rainChance > 30) return { status: "WET", color: "text-blue-500", bgColor: "bg-blue-500" }
    if (weather.temperature > 85) return { status: "HOT", color: "text-red-500", bgColor: "bg-red-500" }
    return { status: "DRY", color: "text-green-500", bgColor: "bg-green-500" }
  }

  // Get track temperature (estimate 20-30°F higher than air temp)
  const getTrackTemp = () => {
    if (!weather) return 0
    return weather.temperature + 25
  }

  // Get funny advice based on conditions
  const getAdvice = () => {
    if (!weather) return "🏁 Ready to race!"
    
    const trackStatus = getTrackStatus()
    const trackTemp = getTrackTemp()

    // Rain jokes
    if (weather.rainChance > 50) {
      return "🌧️ It's raining! Make sure Traction Control is ON... or just do a donut for me! 😈"
    }
    if (weather.rainChance > 30) {
      return "☔ Rain incoming! TC recommended, unless you're feeling spicy... 🌶️"
    }

    // Hot weather jokes
    if (trackTemp > 120) {
      return `🔥 ${trackTemp}°F track temp! No need for TC, the roads are COOKING! You could fry an egg out there! 🍳`
    }
    if (trackTemp > 100) {
      return `🌡️ Track is HOT at ${trackTemp}°F! Tires will grip like crazy. Send it! 🚀`
    }

    // Cold weather
    if (weather.temperature < 40) {
      return "🥶 Brr! Cold out there. Warm up those tires before sending it!"
    }

    // Windy
    if (weather.windSpeed > 25) {
      return `💨 ${weather.windSpeed} MPH winds! Watch those crosswinds, chief!`
    }

    // Perfect conditions
    if (weather.temperature > 60 && weather.temperature < 80 && weather.rainChance < 10) {
      return "✨ PERFECT CONDITIONS! This is it, this is the one. Full send! 🏎️💨"
    }

    // Default
    return "🏁 Conditions are good! Time to lay down some rubber! 🏎️"
  }

  if (loading) {
    return (
      <MonitorPanel title="TRACK CONDITIONS" indicator="green">
        <div className="bg-[#0C0C0C] rounded border border-[#222] p-4 flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF7F] mx-auto mb-2"></div>
            <p className="text-[#9E9E9E] text-xs">Loading track data...</p>
          </div>
        </div>
      </MonitorPanel>
    )
  }

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : { emoji: "🌤️", desc: "UNKNOWN", color: "text-gray-400" }
  const trackStatus = getTrackStatus()
  const trackTemp = getTrackTemp()

  return (
    <MonitorPanel title="TRACK CONDITIONS" indicator="green">
      <div className="bg-[#0C0C0C] rounded border border-[#222] p-3 space-y-3" style={{ borderRadius: "8px" }}>
        {/* Mobile & Desktop: Unified layout */}
        <div>
          {/* Location Header */}
          {location && (
            <div className="mb-3 pb-2 border-b border-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">YOUR LOCATION</div>
                  <div className="text-sm font-bold text-[#00D9FF] font-[family-name:var(--font-heading)] uppercase">
                    {location.city}, {location.state}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weather Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl">{weatherInfo.emoji}</div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                {weather?.temperature || "--"}°F
              </div>
              <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">
                {weatherInfo.desc}
              </div>
            </div>
          </div>

          {/* Track Status Badge */}
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2 mb-3" style={{ borderRadius: "6px" }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">TRACK STATUS</span>
              <span className={"text-xs font-bold " + trackStatus.color + " flex items-center gap-1 font-[family-name:var(--font-heading)]"} >
                <div className={"h-2 w-2 rounded-full " + trackStatus.bgColor + " animate-pulse"} />
                {trackStatus.status}
              </span>
            </div>
          </div>

          {/* Track Conditions Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2" style={{ borderRadius: "6px" }}>
              <div className="text-[9px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)] tracking-wide">TRACK TEMP</div>
              <div className="text-lg font-bold text-[#00FF7F] font-[family-name:var(--font-mono)]">
                {trackTemp}°F
              </div>
            </div>
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2" style={{ borderRadius: "6px" }}>
              <div className="text-[9px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)] tracking-wide">HUMIDITY</div>
              <div className="text-lg font-bold text-[#00D9FF] font-[family-name:var(--font-mono)]">
                {weather?.humidity || "--"}%
              </div>
            </div>
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2" style={{ borderRadius: "6px" }}>
              <div className="text-[9px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)] tracking-wide">WIND</div>
              <div className="text-lg font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                {weather?.windSpeed || "--"} <span className="text-sm">MPH</span>
              </div>
            </div>
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2" style={{ borderRadius: "6px" }}>
              <div className="text-[9px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)] tracking-wide">RAIN CHANCE</div>
              <div className={
                "text-lg font-bold font-[family-name:var(--font-mono)] " +
                ((weather?.rainChance || 0) > 50 ? "text-[#00FF7F]" :
                (weather?.rainChance || 0) > 30 ? "text-yellow-500" :
                "text-[#00FF7F]")
              }>
                {weather?.rainChance || 0}%
              </div>
            </div>
          </div>

          {/* Feels Like & Wind Direction */}
          <div className="flex gap-2 mb-3 text-xs">
            <div className="flex-1 bg-[#0D0D0D] border border-[#1A1A1A] rounded px-2 py-1.5 flex justify-between items-center" style={{ borderRadius: "6px" }}>
              <span className="text-[#9E9E9E]">Feels Like</span>
              <span className="font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">{weather?.feelsLike || "--"}°F</span>
            </div>
            <div className="flex-1 bg-[#0D0D0D] border border-[#1A1A1A] rounded px-2 py-1.5 flex justify-between items-center" style={{ borderRadius: "6px" }}>
              <span className="text-[#9E9E9E]">Wind Dir</span>
              <span className="font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">{weather ? getWindDirection(weather.windDirection) : "--"}</span>
            </div>
          </div>

          {/* Advice Box */}
          <div className="bg-gradient-to-r from-[#00FF7F]/10 to-[#00D9FF]/10 border border-[#00FF7F]/30 rounded p-3" style={{ borderRadius: "8px" }}>
            <div className="text-[9px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)] tracking-wide">📡 TRACK ADVISORY</div>
            <div className="text-xs text-[#F5F5F5] leading-relaxed font-[family-name:var(--font-mono)]">
              {getAdvice()}
            </div>
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
