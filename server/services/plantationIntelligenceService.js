const weatherService = require('./weatherService');
const IoTSensor = require('../models/IoTSensor');
const PlantationIntelligence = require('../models/PlantationIntelligence');

/**
 * Cardamom Optimal Parameter Ranges (Spices Board India Guidelines)
 */
const CARDAMOM_OPTIMAL_TARGETS = {
  soil: {
    ph: { min: 5.5, max: 6.8, ideal: 6.2 },
    npk: {
      n: { min: 120, max: 180, ideal: 150 },
      p: { min: 40, max: 75, ideal: 55 },
      k: { min: 150, max: 220, ideal: 185 },
    },
    organicCarbon: { min: 1.5, max: 3.5, ideal: 2.2 },
    moisture: { min: 65, max: 80, ideal: 72 },
  },
  weather: {
    temp: { min: 15, max: 30, ideal: 22 },
    humidity: { min: 70, max: 85, ideal: 78 },
    windSpeed: { max: 20 },
  },
};

/**
 * Deterministic Engine: Calculate Scores, Recommendations & Risk Monitor
 */
const generatePlantationIntelligenceReport = async (plantation, user) => {
  const district = plantation.district || plantation.location || 'Idukki, Kerala';
  const lat = plantation.latitude || 9.85;
  const lon = plantation.longitude || 76.97;

  // 1. Fetch Real Weather Telemetry (via OpenWeatherMap / Open-Meteo)
  let weatherResult = null;
  let weatherAvailable = true;
  let weatherWarningText = '';

  try {
    weatherResult = await weatherService.getWeatherTelemetry({ lat, lon, district });
    if (!weatherResult || !weatherResult.currentWeather) {
      weatherAvailable = false;
      weatherWarningText = 'Weather data temporarily unavailable';
    }
  } catch (err) {
    weatherAvailable = false;
    weatherWarningText = 'Weather data temporarily unavailable: ' + err.message;
  }

  const currentWeather = (weatherResult && weatherResult.currentWeather) ? weatherResult.currentWeather : {
    temp: 23,
    feelsLike: 24,
    humidity: 78,
    rain: 0,
    windSpeed: 8,
    condition: 'Partly Cloudy',
    description: 'High Altitude Mist',
    pressure: 1013,
    cloudCoverage: 40,
    locationName: district,
    lat,
    lon,
    lastUpdated: 'Unavailable',
  };

  const forecast = (weatherResult && weatherResult.forecast) ? weatherResult.forecast : {
    hourly: [],
    daily: [],
    rainProbability: 20,
  };

  // 2. Fetch Sensor Data vs Stored Soil Data
  let sensorData = null;
  let isSensorBased = false;
  let sensorStatusText = 'No recent reading';
  let lastSensorTimeText = 'No sensor linked';

  try {
    if (plantation.sensor?.sensorId) {
      sensorData = await IoTSensor.findOne({ sensorId: plantation.sensor.sensorId });
    }
    if (!sensorData) {
      sensorData = await IoTSensor.findOne({ plantationId: plantation._id });
    }
    if (sensorData) {
      isSensorBased = true;
      sensorStatusText = sensorData.status === 'active' ? 'Connected' : sensorData.status === 'warning' ? 'Warning' : 'Offline';
      lastSensorTimeText = sensorData.lastUpdated ? new Date(sensorData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Recently';
    }
  } catch (e) {}

  // Soil parameters (prefer sensor moisture if connected, else plantation soil moisture)
  const soilMoisture = (sensorData && sensorData.status === 'active' && sensorData.moisture !== undefined)
    ? sensorData.moisture
    : (plantation.soil?.moisture ?? plantation.moisture ?? 72);

  const soilPh = plantation.soil?.ph ?? plantation.soilPh ?? 6.2;
  const nVal = plantation.soil?.npk?.n ?? plantation.npk?.n ?? 140;
  const pVal = plantation.soil?.npk?.p ?? plantation.npk?.p ?? 45;
  const kVal = plantation.soil?.npk?.k ?? plantation.npk?.k ?? 180;
  const organicCarbon = plantation.soil?.organicCarbon ?? 1.8;
  const soilType = plantation.soil?.soilType ?? 'Loamy Forest Soil';

  // 3. Compute Deterministic Sub-Scores (0 - 100)
  // A. Soil Suitability Score
  let soilScore = 90;
  if (soilPh < CARDAMOM_OPTIMAL_TARGETS.soil.ph.min || soilPh > CARDAMOM_OPTIMAL_TARGETS.soil.ph.max) {
    soilScore -= 20;
  }
  if (organicCarbon < CARDAMOM_OPTIMAL_TARGETS.soil.organicCarbon.min) {
    soilScore -= 15;
  }
  soilScore = Math.max(30, Math.min(100, Math.round(soilScore)));

  // B. Moisture Condition Score
  let moistureScore = 85;
  if (soilMoisture < 55) moistureScore -= 30;
  else if (soilMoisture < 65) moistureScore -= 15;
  else if (soilMoisture > 82) moistureScore -= 25;
  else if (soilMoisture > 88) moistureScore -= 40;
  moistureScore = Math.max(25, Math.min(100, Math.round(moistureScore)));

  // C. Weather Suitability Score
  let weatherScore = 88;
  if (weatherAvailable) {
    const t = currentWeather.temp;
    const h = currentWeather.humidity;
    const w = currentWeather.windSpeed;
    if (t > 30 || t < 15) weatherScore -= 20;
    if (h > 85 || h < 60) weatherScore -= 15;
    if (w > 20) weatherScore -= 15;
  } else {
    weatherScore = 70; // Penalty for unavailable live weather
  }
  const isIdukkiWayanad = (district || '').toLowerCase().includes('idukki') || (district || '').toLowerCase().includes('wayanad');
  if (!isIdukkiWayanad) weatherScore -= 25;
  weatherScore = Math.max(25, Math.min(100, Math.round(weatherScore)));

  // D. Nutrient Condition Score
  let nutrientScore = 85;
  if (nVal < CARDAMOM_OPTIMAL_TARGETS.soil.npk.n.min) nutrientScore -= 15;
  if (pVal < CARDAMOM_OPTIMAL_TARGETS.soil.npk.p.min) nutrientScore -= 20;
  if (kVal < CARDAMOM_OPTIMAL_TARGETS.soil.npk.k.min) nutrientScore -= 15;
  nutrientScore = Math.max(30, Math.min(100, Math.round(nutrientScore)));

  // E. Overall Plantation Condition Score (Weighted average)
  const overallScore = Math.round(
    soilScore * 0.25 + moistureScore * 0.30 + weatherScore * 0.25 + nutrientScore * 0.20
  );

  let overallStatus = 'Good';
  let shortTermRiskLevel = 'Low';

  if (overallScore >= 85) {
    overallStatus = 'Excellent';
    shortTermRiskLevel = 'Low';
  } else if (overallScore >= 70) {
    overallStatus = 'Good';
    shortTermRiskLevel = 'Low';
  } else if (overallScore >= 55) {
    overallStatus = 'Moderate';
    shortTermRiskLevel = 'Moderate';
  } else if (overallScore >= 40) {
    overallStatus = 'Needs Attention';
    shortTermRiskLevel = 'High';
  } else {
    overallStatus = 'High Risk';
    shortTermRiskLevel = 'Critical';
  }

  // 4. Irrigation Decision Engine
  let irrigationState = 'MONITOR SOIL MOISTURE';
  let irrigationExplanation = '';
  let irrigationAction = '';

  const rainProb = forecast.rainProbability || 20;
  const isRainy = currentWeather.rain > 2 || rainProb >= 60;

  if (soilMoisture > 82 || (soilMoisture > 75 && isRainy)) {
    irrigationState = 'EXCESS MOISTURE RISK';
    irrigationExplanation = `Current soil moisture is high (${soilMoisture}%) and ${isRainy ? 'active/upcoming rainfall' : 'high mist level'} increases waterlogging risk.`;
    irrigationAction = 'Suspend all drip & sprinkler irrigation for 48 hours. Inspect plantation drainage runoff channels immediately.';
  } else if (soilMoisture >= 65 && soilMoisture <= 80) {
    if (isRainy) {
      irrigationState = 'IRRIGATION NOT REQUIRED';
      irrigationExplanation = `Soil moisture is currently adequate (${soilMoisture}%) and expected rainfall probability (${rainProb}%) will maintain root hydration.`;
      irrigationAction = 'Irrigation can be safely postponed today. Monitor soil moisture after rainfall.';
    } else {
      irrigationState = 'MONITOR SOIL MOISTURE';
      irrigationExplanation = `Soil moisture is at ${soilMoisture}% (optimal range 65%-80%). Ambient weather is ${currentWeather.condition.toLowerCase()}.`;
      irrigationAction = 'Maintain standard 45-minute daily micro-drip cycle during cool morning hours.';
    }
  } else {
    irrigationState = 'IRRIGATION RECOMMENDED';
    irrigationExplanation = `Soil moisture level is below ideal (${soilMoisture}%). Cardamom tillers require steady root zone hydration to prevent capsule drop.`;
    irrigationAction = 'Execute a 2-hour pulse drip irrigation cycle in the early morning before 9:00 AM.';
  }

  // 5. Nutrient Insights (N, P, K)
  const nInsight = {
    value: nVal,
    minTarget: CARDAMOM_OPTIMAL_TARGETS.soil.npk.n.min,
    maxTarget: CARDAMOM_OPTIMAL_TARGETS.soil.npk.n.max,
    status: nVal < 120 ? 'Needs Attention' : nVal > 180 ? 'High' : 'Good',
    interpretation: nVal < 120
      ? 'Nitrogen is below the configured target (120 mg/kg). Vegetative tiller growth may slow.'
      : nVal > 180
      ? 'Nitrogen is high. Excessive nitrogen can soften stems and increase rot risk.'
      : 'Nitrogen level is optimal for active vegetative tiller development.',
    recommendedAction: nVal < 120
      ? 'Consider soil-test-based organic nitrogen enrichment (compost or neem cake) rather than applying synthetic fertilizer blindly.'
      : nVal > 180
      ? 'Pause nitrogenous fertilizer applications and ensure shade canopy ventilation.'
      : 'Maintain organic mulch and standard nutrient schedule.',
  };

  const pInsight = {
    value: pVal,
    minTarget: CARDAMOM_OPTIMAL_TARGETS.soil.npk.p.min,
    maxTarget: CARDAMOM_OPTIMAL_TARGETS.soil.npk.p.max,
    status: pVal < 40 ? 'Needs Attention' : pVal > 75 ? 'High' : 'Good',
    interpretation: pVal < 40
      ? 'Phosphorus appears below the configured target range (40-75 mg/kg). Flower panicle initiation and root vigor may be limited.'
      : 'Phosphorus is well-balanced for flower initiation and capsule setting.',
    recommendedAction: pVal < 40
      ? 'Apply rock phosphate or organic bone meal near the root zone after testing soil pH.'
      : 'No additional phosphorus intervention required.',
  };

  const kInsight = {
    value: kVal,
    minTarget: CARDAMOM_OPTIMAL_TARGETS.soil.npk.k.min,
    maxTarget: CARDAMOM_OPTIMAL_TARGETS.soil.npk.k.max,
    status: kVal < 150 ? 'Needs Attention' : kVal > 220 ? 'High' : 'Good',
    interpretation: kVal < 150
      ? 'Potassium is below target (150 mg/kg). Capsule bold weight and drought resistance may drop.'
      : 'Potassium level is optimal, supporting 8mm bold capsule formation and essential oil aroma.',
    recommendedAction: kVal < 150
      ? 'Apply wood ash or bio-potash around clumps during soil loosening.'
      : 'Maintain organic mulching to preserve soil potash.',
  };

  // 6. Weather Impact Analysis
  const weatherImpact = [
    {
      factor: 'Ambient Temperature',
      value: weatherAvailable ? `${currentWeather.temp}°C` : 'Unavailable',
      status: currentWeather.temp > 30 ? 'Thermal Stress' : currentWeather.temp < 15 ? 'Cold Stress' : 'Optimal',
      impact: currentWeather.temp > 30
        ? 'High heat increases evapotranspiration. Increase soil mulching to protect root zone.'
        : currentWeather.temp < 15
        ? 'Cool temperature slows vegetative growth. Reduce unnecessary watering.'
        : 'Current temperature is within the ideal 15°C–30°C cardamom suitability range.',
    },
    {
      factor: 'Relative Humidity',
      value: weatherAvailable ? `${currentWeather.humidity}%` : 'Unavailable',
      status: currentWeather.humidity > 85 ? 'High Fungal Risk' : currentWeather.humidity < 60 ? 'Low Hydration' : 'Suitable',
      impact: currentWeather.humidity > 85
        ? 'High humidity increases Azhukal (Capsule Rot) risk. Monitor lower tiller nodes and ensure canopy ventilation.'
        : currentWeather.humidity < 60
        ? 'Dry air increases water demand. Increase micro-misting or sprinkler frequency.'
        : 'Relative humidity provides healthy canopy mist retention for cardamom tillers.',
    },
    {
      factor: 'Precipitation & Rain Probability',
      value: weatherAvailable ? `${currentWeather.rain} mm (${rainProb}% prob)` : 'Unavailable',
      status: isRainy ? 'Active Rainfall' : 'Dry Period',
      impact: isRainy
        ? 'Rainfall reduces irrigation demand. Postpone granular fertilizer spraying to avoid soil wash-off.'
        : 'Low rainfall probability. Rely on planned micro-drip irrigation.',
    },
    {
      factor: 'Wind Velocity',
      value: weatherAvailable ? `${currentWeather.windSpeed} km/h` : 'Unavailable',
      status: currentWeather.windSpeed > 20 ? 'Strong Winds' : 'Gentle Breeze',
      impact: currentWeather.windSpeed > 20
        ? 'Strong winds may cause foliar spray drift and leaf tear. Postpone chemical spraying.'
        : 'Gentle canopy breeze provides good air movement through the plantation.',
    },
  ];

  // 7. 24 - 72 Hour Forecast Intelligence
  const dailyList = forecast.daily || [];
  const forecast72h = [
    {
      day: 'Today',
      date: dailyList[0]?.date || 'Today',
      pop: dailyList[0]?.pop ?? rainProb,
      temp: dailyList[0]?.maxTemp ?? currentWeather.temp,
      humidity: dailyList[0]?.humidity ?? currentWeather.humidity,
      implication: (dailyList[0]?.pop ?? rainProb) > 50
        ? 'High rain probability. Avoid unnecessary irrigation and postpone foliar fertilizer.'
        : 'Adequate weather window for routine weeding and morning pulse drip.',
      risk: (dailyList[0]?.pop ?? rainProb) > 65 ? 'Moderate Rain Risk' : 'Low',
    },
    {
      day: 'Tomorrow',
      date: dailyList[1]?.date || 'Tomorrow',
      pop: dailyList[1]?.pop ?? Math.max(10, rainProb - 15),
      temp: dailyList[1]?.maxTemp ?? (currentWeather.temp + 1),
      humidity: dailyList[1]?.humidity ?? Math.max(65, currentWeather.humidity - 5),
      implication: (dailyList[1]?.pop ?? 20) > 50
        ? 'Expected rain. Monitor soil moisture before scheduling irrigation.'
        : 'Favorable condition for organic manure application and tiller inspection.',
      risk: (dailyList[1]?.pop ?? 20) > 65 ? 'Rain Risk' : 'Low',
    },
    {
      day: 'Day 3',
      date: dailyList[2]?.date || 'Day 3',
      pop: dailyList[2]?.pop ?? 15,
      temp: dailyList[2]?.maxTemp ?? currentWeather.temp,
      humidity: dailyList[2]?.humidity ?? 72,
      implication: 'Check soil moisture sensors before resuming normal drip cycle.',
      risk: 'Low',
    },
  ];

  // 8. Plantation Risk Monitor List
  const riskMonitor = [];

  if (soilMoisture > 82) {
    riskMonitor.push({
      riskName: 'Excess Soil Moisture Risk',
      severity: 'HIGH',
      reason: `Soil moisture at ${soilMoisture}% creates high root zone saturation.`,
      suggestedAction: 'Clear drainage channels immediately and suspend irrigation for 48 hours.',
    });
  } else if (soilMoisture < 55) {
    riskMonitor.push({
      riskName: 'Low Soil Hydration Stress',
      severity: 'HIGH',
      reason: `Soil moisture (${soilMoisture}%) is below minimum requirement (65%).`,
      suggestedAction: 'Execute 2-hour morning drip irrigation and check mulching layer.',
    });
  }

  if (currentWeather.humidity > 85) {
    riskMonitor.push({
      riskName: 'Fungal Capsule Rot (Azhukal) Risk',
      severity: 'HIGH',
      reason: `High atmospheric humidity (${currentWeather.humidity}%) favors Phytophthora fungal spores.`,
      suggestedAction: 'Prune dense shade canopy branches and inspect lower tiller nodes.',
    });
  }

  if (pInsight.status === 'Needs Attention') {
    riskMonitor.push({
      riskName: 'Phosphorus Deficiency Risk',
      severity: 'MODERATE',
      reason: `Soil phosphorus (${pVal} mg/kg) is below target range (40–75 mg/kg).`,
      suggestedAction: 'Apply rock phosphate or organic compost based on soil test analysis.',
    });
  }

  if (!weatherAvailable) {
    riskMonitor.push({
      riskName: 'Weather Telemetry Unavailable',
      severity: 'MODERATE',
      reason: 'Live weather service connection failed; using stored micro-climate cache.',
      suggestedAction: 'Analysis confidence is calculated based strictly on stored soil measurements.',
    });
  }

  if (!isIdukkiWayanad) {
    riskMonitor.push({
      riskName: 'Non-Primary Cardamom District',
      severity: 'MODERATE',
      reason: `${district} is outside primary high-altitude cardamom rainforest belts (Idukki / Wayanad).`,
      suggestedAction: 'Maintain strict overhead shade tree cover and misting sprinklers.',
    });
  }

  if (riskMonitor.length === 0) {
    riskMonitor.push({
      riskName: 'Optimal Plantation Telemetry',
      severity: 'LOW',
      reason: 'All soil, weather, and nutrient telemetry are within target cardamom parameters.',
      suggestedAction: 'Continue current plantation management schedule.',
    });
  }

  // 9. Prioritized Farmer Recommendations
  const mainAction = irrigationState === 'EXCESS MOISTURE RISK'
    ? 'Soil moisture is high and rain is active/expected. Suspend irrigation and inspect drainage runoff immediately.'
    : soilMoisture < 55
    ? 'Soil moisture is low. Execute early morning 2-hour drip irrigation and check mulching.'
    : pInsight.status === 'Needs Attention'
    ? 'Soil moisture is optimal. Focus on organic soil phosphorus enrichment during the next nutrient cycle.'
    : 'Plantation micro-climate and soil moisture are in good balance. Maintain standard 45-minute morning drip schedule.';

  const immediateRecs = [];
  const within24hRecs = [];
  const thisWeekRecs = [];

  if (soilMoisture > 82) {
    immediateRecs.push({
      action: 'Suspend drip irrigation and inspect plantation drainage channels.',
      severity: 'high',
      reason: `Soil moisture is ${soilMoisture}%. Prevents waterlogging and root rot.`,
    });
  } else if (soilMoisture < 55) {
    immediateRecs.push({
      action: 'Run 2-hour morning pulse drip irrigation cycle.',
      severity: 'high',
      reason: `Soil moisture dropped to ${soilMoisture}%. Protects tiller root hydration.`,
    });
  }

  if (currentWeather.humidity > 85) {
    immediateRecs.push({
      action: 'Inspect lower tiller nodes for Azhukal (rot) spotting.',
      severity: 'high',
      reason: `Relative humidity at ${currentWeather.humidity}% increases fungal pathogen activity.`,
    });
  }

  if (isRainy) {
    within24hRecs.push({
      action: 'Postpone granular NPK and organic fertilizer spraying.',
      severity: 'medium',
      reason: 'Active/expected rainfall will wash away unabsorbed surface nutrients.',
    });
  } else {
    within24hRecs.push({
      action: 'Apply organic mulch (dry leaves/straw) around plant clumps.',
      severity: 'medium',
      reason: 'Helps retain soil moisture and improves soil organic carbon.',
    });
  }

  if (pInsight.status === 'Needs Attention') {
    within24hRecs.push({
      action: 'Plan soil-test-based phosphorus management (rock phosphate).',
      severity: 'medium',
      reason: `Phosphorus (${pVal} mg/kg) is below target 40-75 mg/kg range.`,
    });
  }

  thisWeekRecs.push({
    action: 'Regulate overhead shade tree canopy (Silver Oak / Cedar) to 50-55% light filtering.',
    severity: 'low',
    reason: 'Ensures optimal sunlight absorption without thermal leaf burn.',
  });
  thisWeekRecs.push({
    action: 'Review weekly worker harvesting Roster and tiller pruning schedule.',
    severity: 'low',
    reason: 'Keeps plantation operations running at peak efficiency.',
  });

  // 10. Data Quality & Analysis Confidence
  let confidenceScore = 92;
  let confidenceLevel = 'High';
  let confidenceExplanation = 'Based on complete soil parameters, sensor data and live weather telemetry.';

  if (!weatherAvailable) {
    confidenceScore -= 25;
  }
  if (!isSensorBased) {
    confidenceScore -= 10;
  }
  if (pVal === 45 && nVal === 140) {
    // Default soil values used
    confidenceScore -= 8;
  }

  confidenceScore = Math.max(45, Math.min(98, confidenceScore));
  if (confidenceScore >= 85) {
    confidenceLevel = 'High';
  } else if (confidenceScore >= 65) {
    confidenceLevel = 'Moderate';
    confidenceExplanation = weatherAvailable
      ? 'Based on manual soil parameters and live weather telemetry.'
      : 'Weather API unavailable; confidence is limited to stored soil telemetry.';
  } else {
    confidenceLevel = 'Low';
    confidenceExplanation = 'Limited telemetry available. Please update plantation soil data.';
  }

  // Timestamps
  const weatherUpdatedText = weatherAvailable ? (currentWeather.lastUpdated || 'Just now') : 'Unavailable';
  const soilMoistureUpdatedText = isSensorBased ? (lastSensorTimeText || 'Just now') : 'Recorded in profile';
  const soilTestDateText = plantation.updatedAt ? new Date(plantation.updatedAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recorded today';

  // Structured Fallback AI Explanation
  const aiSummary = `Cardora Plantation Intelligence analyzed ${plantation.name} in ${district}. Overall plantation condition score is ${overallScore}/100 (${overallStatus}). Soil suitability is ${soilScore}%, moisture is ${moistureScore}%, and weather suitability is ${weatherScore}%. ${mainAction}`;

  return {
    plantationId: plantation._id,
    plantationName: plantation.name,
    district,
    analyzedAt: new Date(),

    conditionScore: overallScore,
    overallStatus,
    scoreBreakdown: {
      soilSuitability: soilScore,
      moistureCondition: moistureScore,
      weatherSuitability: weatherScore,
      nutrientCondition: nutrientScore,
      shortTermRiskLevel,
    },

    dataSources: {
      weather: {
        temp: currentWeather.temp,
        feelsLike: currentWeather.feelsLike,
        humidity: currentWeather.humidity,
        rain: currentWeather.rain,
        rainProbability: rainProb,
        windSpeed: currentWeather.windSpeed,
        condition: currentWeather.condition,
        description: currentWeather.description,
        pressure: currentWeather.pressure,
        cloudCoverage: currentWeather.cloudCoverage,
        locationName: currentWeather.locationName || district,
        lat,
        lon,
        fetchedAt: new Date(),
        isAvailable: weatherAvailable,
        warning: weatherWarningText,
      },
      soil: {
        ph: soilPh,
        n: nVal,
        p: pVal,
        k: kVal,
        moisture: soilMoisture,
        soilType,
        organicCarbon,
        isSensorBased,
        sensorId: sensorData ? sensorData.sensorId : (plantation.sensor?.sensorId || ''),
        sensorStatus: sensorStatusText,
        lastSensorUpdate: sensorData?.lastUpdated || plantation.sensor?.lastSensorUpdate || null,
      },
      plantationInfo: {
        area: plantation.area || 5.0,
        variety: plantation.variety || 'Njallani',
        altitude: plantation.altitude || 950,
        irrigationType: plantation.irrigation || 'Drip',
      },
    },

    farmerRecommendations: {
      mainAction,
      immediate: immediateRecs,
      within24to48h: within24hRecs,
      thisWeek: thisWeekRecs,
    },

    irrigationDecision: {
      state: irrigationState,
      explanation: irrigationExplanation,
      action: irrigationAction,
    },

    nutrientInsights: {
      n: nInsight,
      p: pInsight,
      k: kInsight,
    },

    weatherImpact,
    forecast72h,
    riskMonitor,

    analysisConfidence: {
      scorePercent: confidenceScore,
      level: confidenceLevel,
      explanation: confidenceExplanation,
    },
    dataFreshness: {
      weatherUpdatedText,
      soilMoistureUpdatedText,
      soilTestDateText,
    },

    aiSummary,
  };
};

module.exports = {
  generatePlantationIntelligenceReport,
};
