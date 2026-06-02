const mongoose = require('mongoose');

// Message schema for the global comment board
const MessageSchema = new mongoose.Schema({
  // Sequential message number (auto-incremented)
  messageNumber: { type: Number, required: true, unique: true },
  
  // Message content
  text: { type: String, required: true },
  
  // Author information
  username: { type: String, default: "Anonymous" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Reply tracking - which message is this replying to?
  replyTo: { type: Number, default: null }, // Message number being replied to
  
  // Thread/topic (optional categorization)
  topic: { type: String, default: "general" },
  
  // Location data (if user shares location)
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number] } // [lng, lat]
  },
  
  // Reactions/votes
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  
  // Metadata
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  deletedAt: { type: Date }, // Soft delete
  
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
MessageSchema.index({ messageNumber: 1 });
MessageSchema.index({ replyTo: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ topic: 1 });
MessageSchema.index({ location: "2dsphere" });

// Counter for auto-incrementing message numbers
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

// Pre-save hook to auto-increment message number
MessageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'messageNumber' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.messageNumber = counter.sequence_value;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = { Message, Counter };
