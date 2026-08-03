const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');

// RECOGNIZED CARDAMOM CULTIVATION REGIONS IN KERALA & SOUTH INDIA
const RECOGNIZED_CARDAMOM_REGIONS = [
  'idukki', 'wayanad', 'vandanmedu', 'munnar', 'kattappana', 
  'udumbanchola', 'devikulam', 'bodinayakanur', 'bodi', 'palakkad', 
  'coorg', 'kodagu', 'chikmagalur', 'chikkamagaluru', 'kallar', 'nedumkandam'
];

/**
 * Format OpenWeatherMap Icon URL
 */
const getWeatherIconUrl = (iconCode) => {
  if (!iconCode) return 'https://openweathermap.org/img/wn/10d@2x.png';
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

/**
 * Check if location is in recognized cardamom cultivation region
 */
const isCardamomRegion = (locationStr = '') => {
  const locLower = (locationStr || '').toLowerCase();
  return RECOGNIZED_CARDAMOM_REGIONS.some((reg) => locLower.includes(reg));
};

/**
 * Calculate Cardamom Suitability Score, Status, AI Recommendations & Weather Alerts
 */
const analyzeCardamomAdvisory = (currentWeather, forecastList = [], locationName = '') => {
  const temp = currentWeather.temp || 24;
  const feelsLike = currentWeather.feelsLike || temp;
  const humidity = currentWeather.humidity || 75;
  const windSpeed = currentWeather.windSpeed || 8;
  const rain = currentWeather.rain || 0;
  const condition = (currentWeather.condition || '').toLowerCase();
  const description = (currentWeather.description || '').toLowerCase();

  let score = 100;
  const warnings = [];
  const aiRecommendations = [];
  const weatherAlerts = [];

  // 1. Temperature Analysis (Ideal: 15°C to 30°C)
  if (temp > 30) {
    const penalty = Math.min(30, (temp - 30) * 5);
    score -= penalty;
    warnings.push(`High temperature detected (${temp}°C). Thermal stress may dehydrate cardamom tillers.`);
    aiRecommendations.push({
      category: 'High Temperature',
      severity: 'high',
      icon: 'Thermometer',
      title: 'High Temperature Advisory',
      actions: [
        'Increase overhead sprinkler / drip irrigation frequency.',
        'Apply organic mulch (straw or dried leaves) around cardamom clumps.',
        'Avoid applying pesticides or fertilizers during midday heat to prevent chemical burns.',
      ],
    });
    weatherAlerts.push({
      id: 'alert_high_temp',
      type: 'warning',
      title: '🌡️ High Temperature Alert',
      message: `Current temp is ${temp}°C. Increase soil mulching and morning irrigation.`,
    });
  } else if (temp < 15) {
    const penalty = Math.min(25, (15 - temp) * 5);
    score -= penalty;
    warnings.push(`Cold ambient temperature (${temp}°C) slows tiller vegetative growth.`);
    aiRecommendations.push({
      category: 'Cold Weather',
      severity: 'medium',
      icon: 'Snowflake',
      title: 'Cold Stress Advisory',
      actions: [
        'Monitor plant cold stress and root vigor.',
        'Reduce unnecessary irrigation to protect soil root warmth.',
      ],
    });
  }

  // 2. Humidity Analysis (Ideal: 70% to 92%)
  if (humidity > 85) {
    const penalty = Math.min(20, (humidity - 85) * 2);
    score -= penalty;
    warnings.push(`Elevated atmospheric humidity (${humidity}%). Increased vulnerability to fungal pathogens.`);
    aiRecommendations.push({
      category: 'High Humidity',
      severity: 'high',
      icon: 'Droplets',
      title: 'Fungal Infection Mitigation',
      actions: [
        'Monitor plantation closely for Azhukal (Rot) and Capsule Rot fungal infections.',
        'Prune dense overhead shade tree branches to improve canopy air circulation.',
      ],
    });
    weatherAlerts.push({
      id: 'alert_fungal_risk',
      type: 'danger',
      title: '🍄 Fungal Disease Risk Alert',
      message: `Humidity at ${humidity}%. High risk of Azhukal (Capsule Rot). Inspect lower tiller nodes.`,
    });
    weatherAlerts.push({
      id: 'alert_high_humidity',
      type: 'warning',
      title: '💧 High Humidity Warning',
      message: `Relative humidity is ${humidity}%. Ensure adequate shade canopy ventilation.`,
    });
  } else if (humidity < 60) {
    const penalty = Math.min(25, (60 - humidity) * 2);
    score -= penalty;
    warnings.push(`Low relative humidity (${humidity}%). Risk of tiller moisture depletion.`);
    aiRecommendations.push({
      category: 'Low Humidity',
      severity: 'medium',
      icon: 'Wind',
      title: 'Soil Moisture Preservation',
      actions: [
        'Increase micro-irrigation volume.',
        'Check soil moisture levels at 15cm depth.',
      ],
    });
    weatherAlerts.push({
      id: 'alert_low_humidity',
      type: 'warning',
      title: '🌵 Low Humidity Alert',
      message: `Low humidity (${humidity}%). Check soil moisture and increase misting.`,
    });
  }

  // 3. Rainfall Analysis
  if (rain > 15 || condition.includes('rain') || condition.includes('drizzle') || description.includes('heavy rain')) {
    score -= 15;
    aiRecommendations.push({
      category: 'Heavy Rain',
      severity: 'critical',
      icon: 'CloudRain',
      title: 'Heavy Rainfall Protocol',
      actions: [
        'Delay NPK and organic fertilizer application to prevent nutrient runoff.',
        'Clear plantation drainage channels to prevent waterlogging around cardamom roots.',
        'Monitor for fungal rot diseases following heavy downpours.',
      ],
    });
    weatherAlerts.push({
      id: 'alert_heavy_rain',
      type: 'danger',
      title: '🌧️ Heavy Rain Alert',
      message: 'Active rainfall detected. Postpone chemical spray and clean drainage runoff paths.',
    });
    weatherAlerts.push({
      id: 'alert_fertilizer_timing',
      type: 'info',
      title: '⏳ Fertilizer Timing Alert',
      message: 'Delay granular fertilizer applications during rain to avoid soil wash-away.',
    });
  } else if (rain === 0 && temp > 25 && humidity < 70) {
    weatherAlerts.push({
      id: 'alert_irrigation',
      type: 'info',
      title: '🚰 Irrigation Reminder',
      message: 'Dry spell conditions active. Maintain 25mm weekly equivalent irrigation.',
    });
  }

  // 4. Thunderstorm Check
  if (condition.includes('thunderstorm') || description.includes('thunder')) {
    score -= 20;
    weatherAlerts.push({
      id: 'alert_thunderstorm',
      type: 'danger',
      title: '⚡ Thunderstorm Warning',
      message: 'Severe electrical weather in area. Ensure field workers take safety precautions.',
    });
  }

  // 5. Wind Speed Analysis (> 20 km/h)
  if (windSpeed > 20) {
    const penalty = Math.min(20, (windSpeed - 20) * 1.5);
    score -= penalty;
    warnings.push(`Strong winds detected (${windSpeed} km/h). May cause leaf tear & tiller lodge.`);
    aiRecommendations.push({
      category: 'Strong Wind',
      severity: 'medium',
      icon: 'Wind',
      title: 'Wind Protection Advisory',
      actions: [
        'Delay pesticide or foliar nutrient spraying until wind subsides.',
        'Support young cardamom tillers and tender flower panicles.',
      ],
    });
    weatherAlerts.push({
      id: 'alert_strong_wind',
      type: 'warning',
      title: '💨 Strong Wind Alert',
      message: `Wind gusts up to ${windSpeed} km/h. Postpone foliar pesticide sprays.`,
    });
  }

  // Determine Final Suitability Score & Status
  const finalScore = Math.max(25, Math.min(98, Math.round(score)));

  let status = 'Suitable';
  let badgeColor = 'bg-[#1F5E3B] text-white';
  let statusEmoji = '🟢';

  if (finalScore >= 85) {
    status = 'Excellent for Cardamom';
    statusEmoji = '🟢';
    badgeColor = 'bg-[#1F5E3B] text-white';
  } else if (finalScore >= 70) {
    status = 'Suitable';
    statusEmoji = '🟢';
    badgeColor = 'bg-[#5C8D4E] text-white';
  } else if (finalScore >= 55) {
    status = 'Suitable with Precautions';
    statusEmoji = '🟡';
    badgeColor = 'bg-[#C9A227] text-white';
  } else if (finalScore >= 40) {
    status = 'Moderate Risk';
    statusEmoji = '🟠';
    badgeColor = 'bg-orange-600 text-white';
  } else {
    status = 'High Risk';
    statusEmoji = '🔴';
    badgeColor = 'bg-red-600 text-white';
  }

  // Region Check
  const inRecognizedRegion = isCardamomRegion(locationName);
  const regionNotice = inRecognizedRegion
    ? 'Your plantation is located in a recognized cardamom cultivation region. Continue monitoring real-time weather and soil conditions for optimal crop management.'
    : 'Real-time weather evaluation active. Local environmental parameters are analyzed dynamically for cardamom suitability.';

  return {
    score: finalScore,
    status,
    statusEmoji,
    badgeColor,
    warnings,
    aiRecommendations,
    weatherAlerts,
    isRecognizedCardamomRegion: inRecognizedRegion,
    regionNotice,
  };
};

/**
 * Fetch Current Weather & 5-Day Forecast from OpenWeatherMap API with MongoDB Caching & Fallback
 */
const getWeatherTelemetry = async ({ lat, lon, district = 'Idukki, Kerala' }) => {
  const apiKey = (process.env.OPENWEATHER_API_KEY || 'b69076289e1d062fc7e268962002f232').trim();
  const cleanDistrict = (district || 'Idukki').split(',')[0].trim();
  const locationKey = lat && lon ? `coords_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}` : `dist_${cleanDistrict.toLowerCase()}`;

  // 1. Check MongoDB Cache (Cache validity: 45 minutes)
  try {
    const cached = await WeatherCache.findOne({ locationKey });
    if (cached && cached.fetchedAt) {
      const ageInMinutes = (Date.now() - new Date(cached.fetchedAt).getTime()) / (1000 * 60);
      if (ageInMinutes < 45) {
        return {
          success: true,
          source: 'cache',
          district: cached.district,
          lat: cached.lat,
          lon: cached.lon,
          currentWeather: cached.currentWeather,
          forecast: cached.forecast,
          suitability: cached.suitability,
          aiRecommendations: cached.aiRecommendations,
          weatherAlerts: cached.weatherAlerts,
          isRecognizedCardamomRegion: cached.isRecognizedCardamomRegion,
          regionNotice: cached.regionNotice,
          isFallback: false,
          warningMessage: '',
          fetchedAt: cached.fetchedAt,
        };
      }
    }
  } catch (dbErr) {
    console.warn('WeatherCache DB read warning:', dbErr.message);
  }

  // 2. Fetch Live Weather Data from OpenWeatherMap API
  try {
    let weatherUrl = '';
    let forecastUrl = '';

    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanDistrict)},IN&units=metric&appid=${apiKey}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cleanDistrict)},IN&units=metric&appid=${apiKey}`;
    }

    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(weatherUrl),
      axios.get(forecastUrl).catch(() => ({ data: { list: [] } })),
    ]);

    const wData = weatherRes.data;
    const fData = forecastRes.data;

    // Parse Current Weather
    const mainObj = wData.main || {};
    const windObj = wData.wind || {};
    const weatherArray = wData.weather && wData.weather[0] ? wData.weather[0] : {};
    const sysObj = wData.sys || {};
    const rainObj = wData.rain || {};

    const currentWeather = {
      temp: Math.round(mainObj.temp ?? 24.5),
      feelsLike: Math.round(mainObj.feels_like ?? 25),
      minTemp: Math.round(mainObj.temp_min ?? 20),
      maxTemp: Math.round(mainObj.temp_max ?? 28),
      humidity: mainObj.humidity ?? 78,
      pressure: mainObj.pressure ?? 1012,
      condition: weatherArray.main || 'Clouds',
      description: (weatherArray.description || 'partly cloudy').replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: weatherArray.icon || '03d',
      iconUrl: getWeatherIconUrl(weatherArray.icon),
      windSpeed: Math.round((windObj.speed || 2.5) * 3.6), // convert m/s to km/h
      windDeg: windObj.deg || 180,
      rain: rainObj['1h'] || rainObj['3h'] || 0,
      visibility: Math.round((wData.visibility || 10000) / 1000), // in km
      cloudCoverage: wData.clouds?.all ?? 40,
      sunrise: sysObj.sunrise ? new Date(sysObj.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 AM',
      sunset: sysObj.sunset ? new Date(sysObj.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:45 PM',
      locationName: wData.name || cleanDistrict,
      country: sysObj.country || 'IN',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Parse Forecast List (Hourly & 5-Day)
    const rawList = fData.list || [];
    const hourlyForecast = rawList.slice(0, 8).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main?.temp ?? 24),
      icon: item.weather?.[0]?.icon || '03d',
      iconUrl: getWeatherIconUrl(item.weather?.[0]?.icon),
      condition: item.weather?.[0]?.main || 'Clouds',
      pop: Math.round((item.pop || 0) * 100), // Rain probability
      humidity: item.main?.humidity || 75,
      windSpeed: Math.round((item.wind?.speed || 2) * 3.6),
    }));

    // Group 5-Day Daily Forecast
    const dailyMap = {};
    rawList.forEach((item) => {
      const dateStr = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
          date: dateStr,
          minTemp: Math.round(item.main?.temp_min ?? 20),
          maxTemp: Math.round(item.main?.temp_max ?? 28),
          humidity: item.main?.humidity || 75,
          pop: Math.round((item.pop || 0) * 100),
          windSpeed: Math.round((item.wind?.speed || 2) * 3.6),
          icon: item.weather?.[0]?.icon || '02d',
          iconUrl: getWeatherIconUrl(item.weather?.[0]?.icon),
          condition: item.weather?.[0]?.main || 'Clouds',
          description: item.weather?.[0]?.description || '',
        };
      } else {
        dailyMap[dateStr].minTemp = Math.min(dailyMap[dateStr].minTemp, Math.round(item.main?.temp_min ?? 20));
        dailyMap[dateStr].maxTemp = Math.max(dailyMap[dateStr].maxTemp, Math.round(item.main?.temp_max ?? 28));
        dailyMap[dateStr].pop = Math.max(dailyMap[dateStr].pop, Math.round((item.pop || 0) * 100));
      }
    });

    const dailyForecast = Object.values(dailyMap).slice(0, 5);

    const forecastObj = {
      hourly: hourlyForecast,
      daily: dailyForecast,
      rainProbability: hourlyForecast[0]?.pop || (currentWeather.rain > 0 ? 90 : 20),
    };

    // Calculate Advisory & Suitability
    const advisoryResult = analyzeCardamomAdvisory(currentWeather, rawList, cleanDistrict);

    const responsePayload = {
      success: true,
      source: 'live',
      district: cleanDistrict,
      lat: wData.coord?.lat || lat,
      lon: wData.coord?.lon || lon,
      currentWeather,
      forecast: forecastObj,
      suitability: advisoryResult,
      aiRecommendations: advisoryResult.aiRecommendations,
      weatherAlerts: advisoryResult.weatherAlerts,
      isRecognizedCardamomRegion: advisoryResult.isRecognizedCardamomRegion,
      regionNotice: advisoryResult.regionNotice,
      isFallback: false,
      warningMessage: '',
      fetchedAt: new Date(),
    };

    // Save to MongoDB Cache asynchronously
    WeatherCache.findOneAndUpdate(
      { locationKey },
      {
        locationKey,
        district: cleanDistrict,
        lat: responsePayload.lat,
        lon: responsePayload.lon,
        currentWeather: responsePayload.currentWeather,
        forecast: responsePayload.forecast,
        suitability: responsePayload.suitability,
        aiRecommendations: responsePayload.aiRecommendations,
        weatherAlerts: responsePayload.weatherAlerts,
        isRecognizedCardamomRegion: responsePayload.isRecognizedCardamomRegion,
        regionNotice: responsePayload.regionNotice,
        isFallback: false,
        warningMessage: '',
        fetchedAt: new Date(),
      },
      { upsert: true, new: true }
    ).catch((err) => console.warn('WeatherCache save warning:', err.message));

    return responsePayload;
  } catch (apiError) {
    console.error('OpenWeatherMap API Error:', apiError.message);

    // 3. Fallback: Try reading last cached data from MongoDB
    try {
      const cached = await WeatherCache.findOne({ locationKey }).sort({ updatedAt: -1 });
      if (cached) {
        return {
          success: true,
          source: 'cache_fallback',
          district: cached.district || cleanDistrict,
          lat: cached.lat,
          lon: cached.lon,
          currentWeather: cached.currentWeather,
          forecast: cached.forecast,
          suitability: cached.suitability,
          aiRecommendations: cached.aiRecommendations,
          weatherAlerts: cached.weatherAlerts,
          isRecognizedCardamomRegion: cached.isRecognizedCardamomRegion,
          regionNotice: cached.regionNotice,
          isFallback: true,
          warningMessage: 'Live OpenWeatherMap connection unavailable. Displaying cached plantation micro-climate telemetry.',
          fetchedAt: cached.fetchedAt,
        };
      }
    } catch (e) {}

    // 4. Default High-Grade Fallback Data for Idukki Cardamom Ecosystem
    const fallbackCurrent = {
      temp: 23,
      feelsLike: 24,
      minTemp: 19,
      maxTemp: 27,
      humidity: 78,
      pressure: 1013,
      condition: 'Partly Cloudy',
      description: 'Scattered Clouds & High Humidity',
      icon: '03d',
      iconUrl: getWeatherIconUrl('03d'),
      windSpeed: 9,
      windDeg: 160,
      rain: 0,
      visibility: 9,
      cloudCoverage: 45,
      sunrise: '06:14 AM',
      sunset: '06:42 PM',
      locationName: cleanDistrict || 'Idukki, Kerala',
      country: 'IN',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const fallbackAdvisory = analyzeCardamomAdvisory(fallbackCurrent, [], cleanDistrict);

    return {
      success: true,
      source: 'simulated_fallback',
      district: cleanDistrict,
      lat: lat || 9.85,
      lon: lon || 76.97,
      currentWeather: fallbackCurrent,
      forecast: {
        hourly: [
          { time: '12:00 PM', temp: 25, icon: '02d', iconUrl: getWeatherIconUrl('02d'), condition: 'Clouds', pop: 20, humidity: 72, windSpeed: 10 },
          { time: '03:00 PM', temp: 26, icon: '03d', iconUrl: getWeatherIconUrl('03d'), condition: 'Clouds', pop: 30, humidity: 75, windSpeed: 12 },
          { time: '06:00 PM', temp: 23, icon: '10d', iconUrl: getWeatherIconUrl('10d'), condition: 'Rain', pop: 60, humidity: 84, windSpeed: 8 },
          { time: '09:00 PM', temp: 21, icon: '10n', iconUrl: getWeatherIconUrl('10n'), condition: 'Rain', pop: 50, humidity: 88, windSpeed: 6 },
        ],
        daily: [
          { day: 'Today', date: 'Today', minTemp: 19, maxTemp: 26, humidity: 78, pop: 40, windSpeed: 9, icon: '03d', iconUrl: getWeatherIconUrl('03d'), condition: 'Partly Cloudy' },
          { day: 'Tomorrow', date: 'Tomorrow', minTemp: 18, maxTemp: 25, humidity: 82, pop: 65, windSpeed: 11, icon: '10d', iconUrl: getWeatherIconUrl('10d'), condition: 'Light Rain' },
          { day: 'Wed', date: 'Wed', minTemp: 19, maxTemp: 27, humidity: 74, pop: 20, windSpeed: 8, icon: '02d', iconUrl: getWeatherIconUrl('02d'), condition: 'Sunny Spells' },
        ],
        rainProbability: 40,
      },
      suitability: fallbackAdvisory,
      aiRecommendations: fallbackAdvisory.aiRecommendations,
      weatherAlerts: fallbackAdvisory.weatherAlerts,
      isRecognizedCardamomRegion: fallbackAdvisory.isRecognizedCardamomRegion,
      regionNotice: fallbackAdvisory.regionNotice,
      isFallback: true,
      warningMessage: 'Live OpenWeatherMap weather API is temporarily offline. Showing estimated Idukki micro-climate telemetry.',
      fetchedAt: new Date(),
    };
  }
};

module.exports = {
  getWeatherTelemetry,
  analyzeCardamomAdvisory,
  isCardamomRegion,
};
