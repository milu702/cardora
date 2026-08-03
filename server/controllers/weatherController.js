const { getWeatherTelemetry } = require('../services/weatherService');

// @desc    Get Current Weather & Smart Plantation Advisory
// @route   GET /api/weather
// @access  Public / Private
exports.getWeather = async (req, res) => {
  try {
    const { lat, lon, district, location } = req.query;
    const targetDistrict = district || location || req.user?.district || req.user?.location || 'Idukki, Kerala';

    const data = await getWeatherTelemetry({
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      district: targetDistrict,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch weather telemetry',
    });
  }
};

// @desc    Get Weather Forecast & Trends
// @route   GET /api/weather/forecast
// @access  Public / Private
exports.getForecast = async (req, res) => {
  try {
    const { lat, lon, district, location } = req.query;
    const targetDistrict = district || location || req.user?.district || req.user?.location || 'Idukki, Kerala';

    const data = await getWeatherTelemetry({
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      district: targetDistrict,
    });

    res.status(200).json({
      success: true,
      district: data.district,
      currentWeather: data.currentWeather,
      forecast: data.forecast,
      isFallback: data.isFallback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch forecast telemetry',
    });
  }
};
