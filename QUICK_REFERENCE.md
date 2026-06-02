# 🚀 Huddle Quick Reference

## Installation (3 Steps)
```bash
# 1. Install server dependencies
cd server && npm install

# 2. Install client dependencies  
cd .. && npm install

# 3. Configure server/.env
MONGO_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_secret_key
```

## Running the App
```bash
# Terminal 1 - Server
cd server
node index.js

# Terminal 2 - Client
npm start
```

---

## 📡 API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register
Body: { username, email, password }

# Login
POST /api/auth/login  
Body: { email, password }

# Get Profile (requires token)
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }

# Update Profile (requires token)
PUT /api/auth/profile
Body: { bio, avatar }
```

### Queries
```bash
# Get All Queries
GET /api/queries

# Get Nearby Queries
GET /api/queries?lat={lat}&lng={lng}&radius={km}

# Add Reply
POST /api/queries/:queryId/reply
Body: { text, username }
```

---

## 🔌 Socket.IO Events

### Client → Server
```javascript
// Share location
socket.emit('send-location', { 
  latitude, longitude, username 
});

// Post query
socket.emit('send-query', { 
  lat, lng, text, user, userId 
});

// Send reply
socket.emit('send-reply', { 
  queryId, text, username, userId 
});
```

### Server → Client
```javascript
// Receive user location
socket.on('receive-location', (data) => {
  // { id, latitude, longitude, username }
});

// Receive new query
socket.on('receive-query', (query) => {
  // { _id, lat, lng, text, user, userId, timestamp, replies }
});

// Receive new reply
socket.on('receive-reply', ({ queryId, reply }) => {
  // reply: { text, username, userId, createdAt }
});

// User disconnected
socket.on('user-disconnected', (socketId) => {
  // Remove user from map
});
```

---

## 🗄️ Database Models

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  location: { type: "Point", coordinates: [lng, lat] },
  createdAt: Date
}
```

### Query
```javascript
{
  question: String,
  user: String,
  userId: ObjectId (ref: User),
  location: { type: "Point", coordinates: [lng, lat] },
  replies: [{
    text: String,
    userId: ObjectId,
    username: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

---

## 🎨 React Components

### Main Components
- `App.js` - Main app wrapper with AuthProvider
- `HuddleMap` - Map component with all features
- `LoginModal` - Authentication modal
- `HeatmapLayer` - Heatmap visualization
- `MapClickHandler` - Map interaction handler

### Context
- `AuthContext` - Global authentication state
  - `user` - Current user object
  - `token` - JWT token
  - `login(email, password)` - Login function
  - `register(username, email, password)` - Register function
  - `logout()` - Logout function
  - `isAuthenticated` - Boolean auth status

---

## 🛠️ Key Files

### Backend
- `server/index.js` - Express server + Socket.IO
- `server/User.js` - User model
- `server/Query.js` - Query model with replies
- `server/authMiddleware.js` - JWT middleware
- `server/.env` - Environment variables

### Frontend
- `src/App.js` - Main application
- `src/AuthContext.js` - Auth state management
- `src/LoginModal.js` - Login/Register UI
- `src/HeatmapLayer.js` - Heatmap component
- `src/index.css` - Global styles + responsive

---

## 🎯 Feature Flags

### Frontend State
```javascript
const [showLoginModal, setShowLoginModal] = useState(false);
const [showHeatmap, setShowHeatmap] = useState(false);
const [radiusFilter, setRadiusFilter] = useState(null);
const [selectedQuery, setSelectedQuery] = useState(null);
```

### Controls
- **Radius Filter:** Dropdown with 1km, 5km, 10km, 25km, All
- **Heatmap Toggle:** Checkbox to show/hide heatmap
- **Auth Modal:** Button in header to open login

---

## 🔐 Authentication Flow

### Register/Login
1. User fills form in LoginModal
2. Submit → POST to `/api/auth/register` or `/api/auth/login`
3. Server validates, hashes password, generates JWT
4. Frontend stores token in localStorage
5. AuthContext updates with user data
6. Modal closes, user logged in

### Token Verification
1. Component mounts → AuthContext checks localStorage
2. If token exists → GET `/api/auth/me`
3. If valid → Set user state
4. If invalid → Clear token, logout

### Protected Requests
```javascript
fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 📍 Geospatial Queries

### MongoDB Query
```javascript
Query.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      $maxDistance: radiusInMeters
    }
  }
})
```

### Frontend Usage
```javascript
// Set radius filter
setRadiusFilter(5); // 5km

// Fetch queries
fetch(`/api/queries?lat=${lat}&lng=${lng}&radius=5`)
```

---

## 🔥 Heatmap Configuration

```javascript
L.heatLayer(points, {
  radius: 30,          // Point radius
  blur: 15,            // Blur amount
  maxZoom: 17,         // Max zoom level
  max: 1.0,            // Max intensity
  gradient: {
    0.0: 'blue',       // Low density
    0.5: 'lime',       // Medium
    0.7: 'yellow',     // High
    1.0: 'red'         // Very high
  }
})
```

---

## 📱 Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }

/* Touch Devices */
@media (hover: none) and (pointer: coarse) { ... }
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` in correct directory |
| Auth not working | Check JWT_SECRET in server/.env |
| Queries not loading | Verify MongoDB connection |
| Location not updating | Allow browser permissions |
| Heatmap not showing | Install leaflet.heat: `npm install` |
| Socket.IO error | Check server is running on port 5000 |

---

## 🔍 Debugging Commands

```bash
# Check server logs
cd server && node index.js

# Check MongoDB connection
# Look for: "Huddle Database Connected!"

# Test API endpoints
curl http://localhost:5000/api/queries

# Check Socket.IO connection
# Browser console: socket.connected (should be true)

# Verify JWT token
# Browser console: localStorage.getItem('huddle_token')
```

---

## 📦 Dependencies

### Server
- express - Web framework
- socket.io - Real-time communication
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin requests
- dotenv - Environment variables

### Client
- react - UI library
- react-leaflet - Map components
- leaflet - Map library
- leaflet.heat - Heatmap plugin
- socket.io-client - Socket.IO client

---

## 🎨 CSS Classes Reference

### Layout
- `.huddle-header` - Top header bar
- `.filter-controls` - Left sidebar filters
- `.stats-panel` - Top-right stats

### Components
- `.modal-overlay` - Login modal background
- `.modal-content` - Login modal content
- `.query-popup` - Query marker popup
- `.reply-form` - Reply input form
- `.replies-section` - Reply list container

### States
- `.auth-btn` - Login/Register button
- `.logout-btn` - Logout button
- `.submit-btn` - Form submit button
- `.error-message` - Error display

---

## 🚀 Deployment Checklist

- [ ] Set strong JWT_SECRET in production
- [ ] Use HTTPS for geolocation
- [ ] Configure CORS for production domain
- [ ] Set MongoDB connection string
- [ ] Update Socket.IO URL in frontend
- [ ] Update API URLs in frontend
- [ ] Enable rate limiting
- [ ] Add logging and monitoring
- [ ] Set up error tracking
- [ ] Configure environment variables
- [ ] Test on mobile devices
- [ ] Optimize bundle size

---

## 📚 Additional Resources

- **Full Documentation:** FEATURES.md
- **Setup Guide:** INSTALLATION.md
- **Change History:** CHANGELOG.md
- **Main README:** README.md

---

**Quick Start:** Run `setup.bat` (Windows) for automated installation!
