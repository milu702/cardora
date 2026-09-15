const mongoose = require('mongoose');
const Plantation = require('../../models/Plantation');
const { getWeatherTelemetry } = require('../../services/weatherService');

/**
 * Retrieves contextual plantation, soil, and weather data for a specific user and plantation.
 */
async function getPlantationContext({ userId, plantationId, userLocation = 'Idukki, Kerala' }) {
  try {
    let plantation = null;

    const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;
    const validPlantationId = (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) ? plantationId : null;

    if (mongoose.connection.readyState === 1) {
      if (validPlantationId && validUserId) {
        plantation = await Plantation.findOne({ _id: validPlantationId, user: validUserId }).maxTimeMS(2000);
      }
      if (!plantation && validUserId) {
        plantation = await Plantation.findOne({ user: validUserId }).sort({ updatedAt: -1 }).maxTimeMS(2000);
      }
    }

    if (!plantation) {
      // Return default Highrange Kerala cardamom context if user has no registered estate yet
      const weather = await getWeatherTelemetry({ district: userLocation });
      return {
        hasPlantation: false,
        plantationName: 'General Cardamom Field',
        areaAcres: 5.0,
        plantsCount: 1200,
        variety: 'Njallani (High Yield)',
        soilMoisture: 72,
        ph: 6.2,
        npk: { n: 140, p: 45, k: 180 },
        healthScore: 88,
        district: userLocation,
        weather: {
          temp: weather?.currentWeather?.temp ?? 26,
          humidity: weather?.currentWeather?.humidity ?? 82,
          rain: weather?.currentWeather?.rain ?? 12,
          condition: weather?.currentWeather?.condition ?? 'Partly Cloudy',
        },
        recentActivity: 'Regular fertigation & shade pruning',
      };
    }

    const district = plantation.district || plantation.location || userLocation;
    const weather = await getWeatherTelemetry({
      district,
      lat: plantation.latitude,
      lon: plantation.longitude,
    });

    const soilMoisture = plantation.sensor?.currentMoisture ?? plantation.soil?.moisture ?? plantation.moisture ?? 70;
    const ph = plantation.soil?.ph ?? plantation.soilPh ?? 6.2;
    const npk = {
      n: plantation.soil?.npk?.n ?? plantation.npk?.n ?? 140,
      p: plantation.soil?.npk?.p ?? plantation.npk?.p ?? 45,
      k: plantation.soil?.npk?.k ?? plantation.npk?.k ?? 180,
    };

    return {
      hasPlantation: true,
      plantationId: plantation._id,
      plantationName: plantation.name || 'Cardamom Estate',
      areaAcres: plantation.area || 5.0,
      plantsCount: plantation.plantsCount || plantation.plants || 1500,
      variety: plantation.variety || 'Njallani',
      soilMoisture,
      ph,
      npk,
      healthScore: plantation.healthScore || plantation.health || 92,
      district,
      weather: {
        temp: weather?.currentWeather?.temp ?? 25,
        humidity: weather?.currentWeather?.humidity ?? 80,
        rain: weather?.currentWeather?.rain ?? 15,
        condition: weather?.currentWeather?.condition ?? 'Sunny / Passing Showers',
      },
      recentActivity: (Array.isArray(plantation.history) && plantation.history[0]?.title) || 'Soil test & sensor update logged',
    };
  } catch (err) {
    console.warn('Error fetching plantation context:', err.message);
    return {
      hasPlantation: false,
      plantationName: 'Default Field Context',
      soilMoisture: 70,
      ph: 6.2,
      npk: { n: 140, p: 45, k: 180 },
      district: userLocation,
      weather: { temp: 26, humidity: 80, rain: 10 },
    };
  }
}

module.exports = {
  getPlantationContext,
};
