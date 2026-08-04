const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Labour', 'Fertilizer', 'Medicine', 'Equipment', 'Transportation', 'Miscellaneous'],
    default: 'Miscellaneous'
  },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

const historyLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, default: '' }
});

const plantationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a plantation name'],
      trim: true,
    },
    ownerName: {
      type: String,
      default: 'Cardora Planter',
    },
    location: {
      type: String,
      default: 'Idukki, Kerala',
    },
    district: {
      type: String,
      default: 'Idukki, Kerala',
    },
    taluk: {
      type: String,
      default: 'Udumbanchola',
    },
    village: {
      type: String,
      default: 'Vandanmedu',
    },
    address: {
      type: String,
      default: 'Vandanmedu Cardamom Estate, Idukki',
    },
    pincode: {
      type: String,
      default: '685551',
    },
    latitude: {
      type: Number,
      default: 9.85,
    },
    longitude: {
      type: Number,
      default: 76.97,
    },
    area: {
      type: Number,
      required: [true, 'Please specify plantation area in acres'],
      default: 5.0,
    },
    altitude: {
      type: Number,
      default: 950, // Meters above sea level
    },
    images: [{ type: String }],
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=1000&q=80',
    },
    // Crop Details
    variety: {
      type: String,
      default: 'Njallani', // Njallani | Green Gold | Vazhukka | Mysore | Custom Variety
    },
    plantingYear: {
      type: Number,
      default: 2021,
    },
    plantsCount: {
      type: Number,
      default: 1500,
    },
    plantAge: {
      type: String,
      default: '3.5 Years',
    },
    // Soil Information
    soil: {
      soilType: { type: String, default: 'Loamy Forest Soil' },
      ph: { type: Number, default: 6.2 },
      npk: {
        n: { type: Number, default: 140 },
        p: { type: Number, default: 45 },
        k: { type: Number, default: 180 },
      },
      organicCarbon: { type: Number, default: 1.8 },
      moisture: { type: Number, default: 72 },
    },
    // Backward compatibility fields
    soilPh: { type: Number, default: 6.2 },
    moisture: { type: Number, default: 72 },
    npk: {
      n: { type: Number, default: 140 },
      p: { type: Number, default: 45 },
      k: { type: Number, default: 180 },
    },
    // Irrigation System
    irrigation: {
      type: String,
      enum: ['Drip', 'Sprinkler', 'Manual', 'Rainfed', 'Mixed'],
      default: 'Drip',
    },
    // Sensor Metadata
    sensor: {
      sensorId: { type: String, default: 'SENSOR-IDK-01' },
      currentMoisture: { type: Number, default: 72 },
      lastSensorUpdate: { type: Date, default: Date.now },
      gpsEnabled: { type: Boolean, default: true },
    },
    // Telemetry & Status
    healthScore: {
      type: Number,
      default: 92,
    },
    weatherStatus: {
      type: String,
      default: 'Optimal High-Altitude Microclimate',
    },
    aiStatus: {
      type: String,
      default: 'Optimal Irrigation Scheduled',
    },
    // Workers Telemetry
    workers: {
      presentToday: { type: Number, default: 8 },
      totalWorkers: { type: Number, default: 10 },
      workingHours: { type: Number, default: 8 },
      taskAssigned: { type: String, default: 'Shade Tree Pruning & Drip Maintenance' },
      tasksCompleted: { type: Number, default: 4 },
      tasksPending: { type: Number, default: 1 },
      workProgress: { type: Number, default: 80 },
      supervisorRemarks: { type: String, default: 'Excellent morning progress across North Plot.' },
    },
    // Expenses Tracking
    expenses: [expenseSchema],
    // Activity History Timeline
    history: [historyLogSchema],
    // Legacy String History for compatibility
    legacyHistory: { type: String, default: 'Registered estate' }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plantation', plantationSchema);
