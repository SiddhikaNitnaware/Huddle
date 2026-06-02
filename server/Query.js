const mongoose = require('mongoose');

// Reply sub-schema for threaded conversations
const ReplySchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// This defines what a "Live Query" looks like [cite: 10, 11]
const QuerySchema = new mongoose.Schema({
  question: { type: String, required: true },
  user: { type: String, default: "Anonymous" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to User model
  // GeoJSON format for the interactive world map [cite: 12, 24]
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  replies: [ReplySchema], // Array of replies for threaded conversations
  createdAt: { type: Date, default: Date.now }
});

// CRITICAL: This allows the system to find nearby responses instantly [cite: 13, 26]
QuerySchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Query', QuerySchema);