const mongoose = require('mongoose');

const weatherCacheSchema = new mongoose.Schema(
  {
    locationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    district: {
      type: String,
      default: 'Idukki, Kerala',
    },
    lat: {
      type: Number,
    },
    lon: {
      type: Number,
    },
    currentWeather: {
      type: Object,
      required: true,
    },
    forecast: {
      type: Object,
      default: {},
    },
    suitability: {
      type: Object,
      required: true,
    },
    aiRecommendations: {
      type: Array,
      default: [],
    },
    weatherAlerts: {
      type: Array,
      default: [],
    },
    isRecognizedCardamomRegion: {
      type: Boolean,
      default: false,
    },
    regionNotice: {
      type: String,
      default: '',
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    warningMessage: {
      type: String,
      default: '',
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically expire cache after 6 hours from database
weatherCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 21600 });

module.exports = mongoose.model('WeatherCache', weatherCacheSchema);
