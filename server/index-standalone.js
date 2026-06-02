const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'huddle_jwt_secret_key_2024_change_this_in_production_abc123xyz789';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.IO for real-time messaging
const io = new Server(server, { 
    cors: { origin: "http://localhost:3000" } 
});

// ===== IN-MEMORY DATA STORES (for testing without database) =====
let messages = [];
let messageCounter = 0;
let users = [];

// ===== UTILITY FUNCTIONS =====

function getNextMessageNumber() {
  return ++messageCounter;
}

function findUserById(id) {
  return users.find(u => u.id === id);
}

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

// ===== GLOBAL MESSAGE BOARD ROUTES =====

// Get messages for the global board (with pagination)
app.get('/api/messages', (req, res) => {
  try {
    const { 
      limit = 50, 
      after = 0,
      topic = null,
      replyTo = null
    } = req.query;

    let filteredMessages = messages.filter(m => !m.deleted);
    
    if (after > 0) {
      filteredMessages = filteredMessages.filter(m => m.messageNumber > parseInt(after));
    }
    
    if (topic) {
      filteredMessages = filteredMessages.filter(m => m.topic === topic);
    }
    
    if (replyTo) {
      filteredMessages = filteredMessages.filter(m => m.replyTo === parseInt(replyTo));
    }

    // Sort by message number
    filteredMessages.sort((a, b) => a.messageNumber - b.messageNumber);
    
    const paginated = filteredMessages.slice(0, parseInt(limit));

    res.json({
      messages: paginated,
      latestNumber: messageCounter,
      hasMore: filteredMessages.length > parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Get a specific message by number
app.get('/api/messages/:messageNumber', (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const message = messages.find(m => m.messageNumber === messageNumber && !m.deleted);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const replies = messages.filter(m => m.replyTo === messageNumber && !m.deleted)
      .sort((a, b) => a.messageNumber - b.messageNumber);

    res.json({
      message,
      replies,
      replyCount: replies.length
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: "Error fetching message" });
  }
});

// Post a new message to the global board
app.post('/api/messages', (req, res) => {
  try {
    const { text, replyTo, topic, location, username } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // If replying to a message, verify it exists
    if (replyTo) {
      const parentMessage = messages.find(m => m.messageNumber === parseInt(replyTo) && !m.deleted);
      if (!parentMessage) {
        return res.status(404).json({ message: 'Parent message not found' });
      }
    }

    const newMessage = {
      messageNumber: getNextMessageNumber(),
      text,
      username: username || 'Anonymous',
      replyTo: replyTo ? parseInt(replyTo) : null,
      topic: topic || 'general',
      location: location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      } : null,
      upvotes: 0,
      downvotes: 0,
      edited: false,
      deleted: false,
      createdAt: new Date()
    };

    messages.push(newMessage);

    res.status(201).json({
      message: 'Message posted successfully',
      data: newMessage
    });

    // Broadcast to all connected socket users
    io.emit('new-message', newMessage);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on a message
app.post('/api/messages/:messageNumber/vote', (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const { vote } = req.body; // 'up' or 'down'

    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const message = messages.find(m => m.messageNumber === messageNumber && !m.deleted);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (vote === 'up') {
      message.upvotes++;
    } else {
      message.downvotes++;
    }

    res.json({
      message: 'Vote recorded',
      upvotes: message.upvotes,
      downvotes: message.downvotes
    });

    // Broadcast vote update
    io.emit('vote-updated', {
      messageNumber: message.messageNumber,
      upvotes: message.upvotes,
      downvotes: message.downvotes
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
app.delete('/api/messages/:messageNumber', (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const message = messages.find(m => m.messageNumber === messageNumber && !m.deleted);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.deleted = true;
    message.text = '[deleted]';

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reply chain for a message (thread view)
app.get('/api/messages/:messageNumber/thread', (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const rootMessage = messages.find(m => m.messageNumber === messageNumber && !m.deleted);

    if (!rootMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const getAllReplies = (msgNum) => {
      const directReplies = messages
        .filter(m => m.replyTo === msgNum && !m.deleted)
        .sort((a, b) => a.messageNumber - b.messageNumber);

      return directReplies.map(reply => ({
        ...reply,
        replies: getAllReplies(reply.messageNumber)
      }));
    };

    const thread = {
      ...rootMessage,
      replies: getAllReplies(messageNumber)
    };

    res.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== AUTHENTICATION ROUTES =====

// Register new user
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    if (findUserByUsername(username) || users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create new user
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      password, // In production, hash this!
      avatar: null,
      bio: '',
      createdAt: new Date()
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== SOCKET.IO EVENTS =====

io.on('connection', (socket) => {
  console.log('User joined:', socket.id);

  // Handle posting messages in real-time
  socket.on('post-message', (data) => {
    try {
      const { text, replyTo, topic, username } = data;

      if (!text || text.trim().length === 0) {
        socket.emit('message-error', { message: 'Message text is required' });
        return;
      }

      if (replyTo) {
        const parentMessage = messages.find(m => m.messageNumber === parseInt(replyTo) && !m.deleted);
        if (!parentMessage) {
          socket.emit('message-error', { message: 'Parent message not found' });
          return;
        }
      }

      const newMessage = {
        messageNumber: getNextMessageNumber(),
        text,
        username: username || 'Anonymous',
        replyTo: replyTo ? parseInt(replyTo) : null,
        topic: topic || 'general',
        upvotes: 0,
        downvotes: 0,
        edited: false,
        deleted: false,
        createdAt: new Date()
      };

      messages.push(newMessage);

      // Broadcast to ALL users
      io.emit('new-message', newMessage);

      // Send confirmation to sender
      socket.emit('message-posted', {
        success: true,
        messageNumber: newMessage.messageNumber
      });
    } catch (err) {
      console.error("Error posting message:", err);
      socket.emit('message-error', { message: 'Failed to post message' });
    }
  });

  // Handle voting in real-time
  socket.on('vote-message', (data) => {
    try {
      const { messageNumber, vote } = data;

      if (!['up', 'down'].includes(vote)) {
        socket.emit('vote-error', { message: 'Invalid vote type' });
        return;
      }

      const message = messages.find(m => m.messageNumber === parseInt(messageNumber) && !m.deleted);
      if (!message) {
        socket.emit('vote-error', { message: 'Message not found' });
        return;
      }

      if (vote === 'up') {
        message.upvotes++;
      } else {
        message.downvotes++;
      }

      // Broadcast updated vote counts to all users
      io.emit('vote-updated', {
        messageNumber: message.messageNumber,
        upvotes: message.upvotes,
        downvotes: message.downvotes
      });
    } catch (err) {
      console.error("Error voting:", err);
      socket.emit('vote-error', { message: 'Failed to vote' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User left:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Message Board Server running on port ${PORT}`);
  console.log(`📡 Features: Sequential numbering, replies, real-time updates, voting`);
  console.log(`🔌 Database: Using in-memory store (standalone mode)`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
});
