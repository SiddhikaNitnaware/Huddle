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

// Initialize Socket.IO for "Instant Responses" [cite: 26, 52]
const io = new Server(server, { 
    cors: { origin: "http://localhost:3000" } // We will use Port 3000 for React
});

// Connect to your free MongoDB cluster [cite: 51]
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Huddle Database Connected!"))
  .catch(err => console.error("Database connection failed:", err));

io.on('connection', (socket) => {
  console.log('User joined the Huddle:', socket.id);

  // Listen for when a user posts a live query on the map [cite: 74]
  socket.on('send_query', async (data) => {
    try {
      const newQuery = new Query({
        question: data.question,
        location: { coordinates: [data.lng, data.lat] }
      });
      await newQuery.save();
      
      // Broadcast to all nearby users in real-time [cite: 12, 76]
      io.emit('receive_query', newQuery); 
    } catch (err) {
      console.error(err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));