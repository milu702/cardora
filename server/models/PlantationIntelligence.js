const mongoose = require('mongoose');

const plantationIntelligenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: true,
      index: true,
    },
    plantationName: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: 'Idukki, Kerala',
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },

    // 1. Overall Scoring & Status
    conditionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    overallStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Moderate', 'Needs Attention', 'High Risk'],
      default: 'Good',
    },
    scoreBreakdown: {
      soilSuitability: { type: Number, default: 85 },
      moistureCondition: { type: Number, default: 75 },
      weatherSuitability: { type: Number, default: 88 },
      nutrientCondition: { type: Number, default: 70 },
      shortTermRiskLevel: { type: String, default: 'Low' },
    },

    // 2. Data Sources & Telemetry Snapshot
    dataSources: {
      weather: {
        temp: { type: Number, default: 23 },
        feelsLike: { type: Number, default: 24 },
        humidity: { type: Number, default: 78 },
        rain: { type: Number, default: 0 },
        rainProbability: { type: Number, default: 20 },
        windSpeed: { type: Number, default: 8 },
        condition: { type: String, default: 'Partly Cloudy' },
        description: { type: String, default: 'High Altitude Mist' },
        pressure: { type: Number, default: 1013 },
        cloudCoverage: { type: Number, default: 40 },
        locationName: { type: String, default: 'Idukki' },
        lat: { type: Number, default: 9.85 },
        lon: { type: Number, default: 76.97 },
        fetchedAt: { type: Date, default: Date.now },
        isAvailable: { type: Boolean, default: true },
        warning: { type: String, default: '' },
      },
      soil: {
        ph: { type: Number, default: 6.2 },
        n: { type: Number, default: 140 },
        p: { type: Number, default: 45 },
        k: { type: Number, default: 180 },
        moisture: { type: Number, default: 72 },
        soilType: { type: String, default: 'Loamy Forest Soil' },
        organicCarbon: { type: Number, default: 1.8 },
        isSensorBased: { type: Boolean, default: false },
        sensorId: { type: String, default: '' },
        sensorStatus: { type: String, default: 'Offline' },
        lastSensorUpdate: { type: Date, default: null },
      },
      plantationInfo: {
        area: { type: Number, default: 5.0 },
        variety: { type: String, default: 'Njallani' },
        altitude: { type: Number, default: 950 },
        irrigationType: { type: String, default: 'Drip' },
      },
    },

    // 3. Farmer Recommendations
    farmerRecommendations: {
      mainAction: { type: String, required: true },
      immediate: [
        {
          action: { type: String, required: true },
          severity: { type: String, default: 'high' },
          reason: { type: String, default: '' },
        },
      ],
      within24to48h: [
        {
          action: { type: String, required: true },
          severity: { type: String, default: 'medium' },
          reason: { type: String, default: '' },
        },
      ],
      thisWeek: [
        {
          action: { type: String, required: true },
          severity: { type: String, default: 'low' },
          reason: { type: String, default: '' },
        },
      ],
    },

    // 4. Irrigation Decision
    irrigationDecision: {
      state: {
        type: String,
        enum: ['IRRIGATION RECOMMENDED', 'IRRIGATION NOT REQUIRED', 'MONITOR SOIL MOISTURE', 'EXCESS MOISTURE RISK'],
        default: 'MONITOR SOIL MOISTURE',
      },
      explanation: { type: String, required: true },
      action: { type: String, required: true },
    },

    // 5. Soil Nutrient Insights
    nutrientInsights: {
      n: {
        value: { type: Number, default: 140 },
        minTarget: { type: Number, default: 120 },
        maxTarget: { type: Number, default: 180 },
        status: { type: String, default: 'Good' },
        interpretation: { type: String, default: '' },
        recommendedAction: { type: String, default: '' },
      },
      p: {
        value: { type: Number, default: 45 },
        minTarget: { type: Number, default: 40 },
        maxTarget: { type: Number, default: 75 },
        status: { type: String, default: 'Good' },
        interpretation: { type: String, default: '' },
        recommendedAction: { type: String, default: '' },
      },
      k: {
        value: { type: Number, default: 180 },
        minTarget: { type: Number, default: 150 },
        maxTarget: { type: Number, default: 220 },
        status: { type: String, default: 'Good' },
        interpretation: { type: String, default: '' },
        recommendedAction: { type: String, default: '' },
      },
    },

    // 6. Weather Impact Analysis
    weatherImpact: [
      {
        factor: { type: String, required: true },
        value: { type: String, required: true },
        status: { type: String, default: 'Suitable' },
        impact: { type: String, required: true },
      },
    ],

    // 7. 24 - 72 Hours Forecast Intelligence
    forecast72h: [
      {
        day: { type: String, required: true },
        date: { type: String, default: '' },
        pop: { type: Number, default: 20 },
        temp: { type: Number, default: 24 },
        humidity: { type: Number, default: 75 },
        implication: { type: String, required: true },
        risk: { type: String, default: 'Low' },
      },
    ],

    // 8. Risk Monitor
    riskMonitor: [
      {
        riskName: { type: String, required: true },
        severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'LOW' },
        reason: { type: String, required: true },
        suggestedAction: { type: String, required: true },
      },
    ],

    // 9. Analysis Confidence & Data Freshness
    analysisConfidence: {
      scorePercent: { type: Number, default: 90 },
      level: { type: String, enum: ['High', 'Moderate', 'Low'], default: 'High' },
      explanation: { type: String, default: 'Based on complete soil parameters and live weather telemetry.' },
    },
    dataFreshness: {
      weatherUpdatedText: { type: String, default: 'Just now' },
      soilMoistureUpdatedText: { type: String, default: 'Just now' },
      soilTestDateText: { type: String, default: 'Recorded today' },
    },

    // 10. AI / Gemini Synthesis (Optional summary)
    aiSummary: {
      type: String,
      default: '',
    },

    // 11. Admin Submission Flags
    isSubmittedToAdmin: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PlantationIntelligence', plantationIntelligenceSchema);
