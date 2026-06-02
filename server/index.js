const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Query = require('./Query');
const User = require('./User');
const { Message, Counter } = require('./Message');
const { authenticateToken, optionalAuth, JWT_SECRET } = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.IO for "Instant Responses"
const io = new Server(server, { 
    cors: { origin: "http://localhost:3000" } 
});

// Connect to your MongoDB cluster or fallback to local
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/huddle";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Huddle Database Connected!"))
  .catch(err => {
    console.error("Database connection failed:", err.message);
    console.log("Continuing without database - some features may not work");
  });

// ===== GLOBAL MESSAGE BOARD ROUTES =====

// Get messages for the global board (with pagination)
app.get('/api/messages', optionalAuth, async (req, res) => {
  try {
    const { 
      limit = 50, 
      after = 0,  // Get messages after this number
      topic = null,
      replyTo = null // Filter messages replying to a specific message
    } = req.query;

    const filter = { deletedAt: null }; // Exclude soft-deleted messages
    
    if (after > 0) {
      filter.messageNumber = { $gt: parseInt(after) };
    }
    
    if (topic) {
      filter.topic = topic;
    }
    
    if (replyTo) {
      filter.replyTo = parseInt(replyTo);
    }

    const messages = await Message.find(filter)
      .sort({ messageNumber: 1 }) // Chronological order
      .limit(parseInt(limit))
      .populate('userId', 'username avatar')
      .lean();

    // Build reply chains
    const messagesWithReplies = messages.map(msg => ({
      ...msg,
      replies: [], // Will be populated by client or separate query
      replyCount: 0 // Can be calculated
    }));

    // Get total message count
    const totalCount = await Counter.findById('messageNumber');
    const latestNumber = totalCount ? totalCount.sequence_value : 0;

    res.json({
      messages: messagesWithReplies,
      latestNumber,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Get a specific message by number
app.get('/api/messages/:messageNumber', async (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const message = await Message.findOne({ 
      messageNumber,
      deletedAt: null 
    }).populate('userId', 'username avatar');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Get all replies to this message
    const replies = await Message.find({ 
      replyTo: messageNumber,
      deletedAt: null 
    })
    .sort({ messageNumber: 1 })
    .populate('userId', 'username avatar');

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
app.post('/api/messages', optionalAuth, async (req, res) => {
  try {
    const { text, replyTo, topic, location } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // If replying to a message, verify it exists
    if (replyTo) {
      const parentMessage = await Message.findOne({ 
        messageNumber: parseInt(replyTo),
        deletedAt: null 
      });
      
      if (!parentMessage) {
        return res.status(404).json({ message: 'Parent message not found' });
      }
    }

    const newMessage = new Message({
      text,
      username: req.user?.username || 'Anonymous',
      userId: req.user?.id || null,
      replyTo: replyTo ? parseInt(replyTo) : null,
      topic: topic || 'general',
      location: location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      } : undefined
    });

    await newMessage.save();

    // Populate user data for response
    await newMessage.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Message posted successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on a message (upvote/downvote)
app.post('/api/messages/:messageNumber/vote', optionalAuth, async (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const { vote } = req.body; // 'up' or 'down'

    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const updateField = vote === 'up' ? 'upvotes' : 'downvotes';
    
    const message = await Message.findOneAndUpdate(
      { messageNumber, deletedAt: null },
      { $inc: { [updateField]: 1 } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Vote recorded',
      upvotes: message.upvotes,
      downvotes: message.downvotes
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit a message (auth required)
app.put('/api/messages/:messageNumber', authenticateToken, async (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);
    const { text } = req.body;

    const message = await Message.findOne({ messageNumber, deletedAt: null });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify ownership
    if (message.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({
      message: 'Message updated',
      data: message
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (soft delete)
app.delete('/api/messages/:messageNumber', authenticateToken, async (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);

    const message = await Message.findOne({ messageNumber, deletedAt: null });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify ownership
    if (message.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.deletedAt = new Date();
    message.text = '[deleted]';
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reply chain for a message (thread view)
app.get('/api/messages/:messageNumber/thread', async (req, res) => {
  try {
    const messageNumber = parseInt(req.params.messageNumber);

    // Get the root message
    const rootMessage = await Message.findOne({ 
      messageNumber,
      deletedAt: null 
    }).populate('userId', 'username avatar');

    if (!rootMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Get all replies recursively
    const getAllReplies = async (msgNum) => {
      const directReplies = await Message.find({ 
        replyTo: msgNum,
        deletedAt: null 
      })
      .sort({ messageNumber: 1 })
      .populate('userId', 'username avatar')
      .lean();

      // For each reply, get its replies
      for (let reply of directReplies) {
        reply.replies = await getAllReplies(reply.messageNumber);
      }

      return directReplies;
    };

    const thread = {
      ...rootMessage.toObject(),
      replies: await getAllReplies(messageNumber)
    };

    res.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== END MESSAGE BOARD ROUTES =====

// ===== AUTHENTICATION ROUTES =====

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
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
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
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

// Get current user profile (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ message: 'Profile updated', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== QUERY ROUTES =====

// API Route to fetch existing queries (with optional radius filter)
app.get('/api/queries', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    let queries;

    // If lat, lng, and radius are provided, perform geospatial query
    if (lat && lng && radius) {
      const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters
      queries = await Query.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radiusInMeters
          }
        }
      }).limit(100).populate('userId', 'username avatar');
    } else {
      // Return all queries (sorted by recent)
      queries = await Query.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'username avatar');
    }

    // Format them to match what the React client expects
    const formattedQueries = queries.map(q => ({
      _id: q._id,
      lat: q.location.coordinates[1],
      lng: q.location.coordinates[0],
      text: q.question,
      user: q.user || "Anonymous",
      userId: q.userId?._id,
      avatar: q.userId?.avatar,
      timestamp: q.createdAt,
      replies: q.replies || []
    }));

    res.json(formattedQueries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: "Error fetching queries" });
  }
});

// Post a reply to a query
app.post('/api/queries/:queryId/reply', optionalAuth, async (req, res) => {
  try {
    const { queryId } = req.params;
    const { text, username } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const query = await Query.findById(queryId);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    const reply = {
      text,
      username: username || 'Anonymous',
      userId: req.user?.id || null,
      createdAt: new Date()
    };

    query.replies.push(reply);
    await query.save();

    res.status(201).json({
      message: 'Reply added successfully',
      reply: query.replies[query.replies.length - 1]
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Route to fetch existing queries when a user joins
app.get('/api/queries', optionalAuth, async (req, res) => {
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

  // NEW: Handle posting messages to the global board
  socket.on('post-message', async (data) => {
    try {
      const { text, replyTo, topic, location, username, userId } = data;

      // Validate
      if (!text || text.trim().length === 0) {
        socket.emit('message-error', { message: 'Message text is required' });
        return;
      }

      // If replying, verify parent exists
      if (replyTo) {
        const parentMessage = await Message.findOne({ 
          messageNumber: parseInt(replyTo),
          deletedAt: null 
        });
        
        if (!parentMessage) {
          socket.emit('message-error', { message: 'Parent message not found' });
          return;
        }
      }

      // Create new message
      const newMessage = new Message({
        text,
        username: username || 'Anonymous',
        userId: userId || null,
        replyTo: replyTo ? parseInt(replyTo) : null,
        topic: topic || 'general',
        location: location ? {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        } : undefined
      });

      await newMessage.save();
      await newMessage.populate('userId', 'username avatar');

      // Broadcast to ALL users
      io.emit('new-message', {
        messageNumber: newMessage.messageNumber,
        text: newMessage.text,
        username: newMessage.username,
        userId: newMessage.userId,
        replyTo: newMessage.replyTo,
        topic: newMessage.topic,
        location: newMessage.location,
        upvotes: newMessage.upvotes,
        downvotes: newMessage.downvotes,
        createdAt: newMessage.createdAt
      });

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

  // NEW: Handle voting in real-time
  socket.on('vote-message', async (data) => {
    try {
      const { messageNumber, vote } = data;

      if (!['up', 'down'].includes(vote)) {
        socket.emit('vote-error', { message: 'Invalid vote type' });
        return;
      }

      const updateField = vote === 'up' ? 'upvotes' : 'downvotes';
      
      const message = await Message.findOneAndUpdate(
        { messageNumber: parseInt(messageNumber), deletedAt: null },
        { $inc: { [updateField]: 1 } },
        { new: true }
      );

      if (!message) {
        socket.emit('vote-error', { message: 'Message not found' });
        return;
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

  // Listen for when a user posts a live query on the map (legacy support)
  socket.on('send-query', async (data) => {
    try {
      const newQuery = new Query({
        question: data.text,
        user: data.user,
        userId: data.userId || null,
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
        userId: data.userId,
        timestamp: newQuery.createdAt,
        replies: []
      }); 
    } catch (err) {
      console.error("Error saving query:", err);
    }
  });

  // Listen for replies to queries (legacy support)
  socket.on('send-reply', async (data) => {
    try {
      const { queryId, text, username, userId } = data;
      
      const query = await Query.findById(queryId);
      if (!query) {
        socket.emit('reply-error', { message: 'Query not found' });
        return;
      }

      const reply = {
        text,
        username: username || 'Anonymous',
        userId: userId || null,
        createdAt: new Date()
      };

      query.replies.push(reply);
      await query.save();

      // Broadcast the reply to all users
      io.emit('receive-reply', {
        queryId,
        reply: query.replies[query.replies.length - 1]
      });
    } catch (err) {
      console.error("Error saving reply:", err);
      socket.emit('reply-error', { message: 'Failed to save reply' });
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
