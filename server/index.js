const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Query = require('./Query');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.IO for "Instant Responses"
const io = new Server(server, { 
    cors: { origin: "http://localhost:3000" } 
});

// Connect to your free MongoDB cluster
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/huddle")
  .then(() => console.log("Huddle Database Connected!"))
  .catch(err => console.error("Database connection failed:", err));

// API Route to fetch existing queries when a user joins
app.get('/api/queries', async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 }).limit(50);
    // Format them to match what the React client expects
    const formattedQueries = queries.map(q => ({
      _id: q._id,
      lat: q.location.coordinates[1],
      lng: q.location.coordinates[0],
      text: q.question,
      user: q.user || "Anonymous",
      timestamp: q.createdAt
    }));
    res.json(formattedQueries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching queries" });
  }
});

io.on('connection', (socket) => {
  console.log('User joined the Huddle:', socket.id);

  // Handle location sharing (when a user moves on the map)
  socket.on('send-location', (data) => {
    // Broadcast this user's location to everyone else
    io.emit('receive-location', {
      id: socket.id,
      latitude: data.latitude,
      longitude: data.longitude,
      username: data.username
    });
  });

  // Listen for when a user posts a live query on the map
  socket.on('send-query', async (data) => {
    try {
      const newQuery = new Query({
        question: data.text,
        user: data.user,
        location: { coordinates: [data.lng, data.lat] }
      });
      await newQuery.save();
      
      // Broadcast to all users in real-time
      io.emit('receive-query', {
        _id: newQuery._id,
        lat: data.lat,
        lng: data.lng,
        text: data.text,
        user: data.user,
        timestamp: newQuery.createdAt
      }); 
    } catch (err) {
      console.error("Error saving query:", err);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User left the Huddle:', socket.id);
    // Tell everyone to remove this user from their map
    io.emit('user-disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
