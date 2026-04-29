const mongoose = require('mongoose');

// This defines what a "Live Query" looks like [cite: 10, 11]
const QuerySchema = new mongoose.Schema({
  question: { type: String, required: true },
  // GeoJSON format for the interactive world map [cite: 12, 24]
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  createdAt: { type: Date, default: Date.now }
});

// CRITICAL: This allows the system to find nearby responses instantly [cite: 13, 26]
QuerySchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Query', QuerySchema);