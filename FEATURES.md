# 🌟 Huddle Features Documentation

## Overview
Huddle is a real-time location-based Q&A platform where users can post queries at specific locations and engage in threaded conversations.

---

## 🔐 Feature 1: Authentication System

### Backend Implementation
**Files Changed:**
- `server/User.js` - New User model with bcrypt password hashing
- `server/authMiddleware.js` - JWT verification middleware
- `server/index.js` - Authentication routes added

**API Endpoints:**

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673abc123...",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": null,
    "bio": ""
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as register

#### GET `/api/auth/me`
Get current user profile (requires JWT token).

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/api/auth/profile`
Update user profile (requires JWT token).

**Request Body:**
```json
{
  "bio": "Huddle enthusiast!",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Frontend Implementation
**Files Added:**
- `src/AuthContext.js` - React Context for auth state management
- `src/LoginModal.js` - Login/Register modal component
- `src/LoginModal.css` - Modal styling

**Features:**
- JWT token stored in localStorage
- Auto-login on page refresh
- Context provider for global auth state
- Login/Register toggle in same modal
- Error handling and validation
- Logout functionality

---

## 💬 Feature 2: Reply System

### Backend Implementation
**Files Changed:**
- `server/Query.js` - Added `replies` array with ReplySchema
- `server/index.js` - Reply routes and Socket.IO handlers

**Database Schema:**
```javascript
ReplySchema = {
  text: String,
  userId: ObjectId,
  username: String,
  createdAt: Date
}
```

**API Endpoints:**

#### POST `/api/queries/:queryId/reply`
Add a reply to a query.

**Request Body:**
```json
{
  "text": "Here's my answer!",
  "username": "john_doe"
}
```

**Socket.IO Events:**

**Client → Server:**
```javascript
socket.emit('send-reply', {
  queryId: '673abc...',
  text: 'Reply text',
  username: 'john_doe',
  userId: '673xyz...'
});
```

**Server → Clients (Broadcast):**
```javascript
socket.on('receive-reply', ({ queryId, reply }) => {
  // Update query with new reply
});
```

### Frontend Implementation
**Features:**
- Reply input in query popups
- Real-time reply broadcasting
- Reply count badge on markers
- Scrollable replies list
- Enter key to submit
- Anonymous replies supported

---

## 📍 Feature 3: Nearby Queries Filter

### Backend Implementation
**Files Changed:**
- `server/index.js` - Updated `/api/queries` endpoint

**Geospatial Query:**
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

**API Endpoint:**

#### GET `/api/queries?lat={lat}&lng={lng}&radius={km}`
Fetch queries within specified radius.

**Example:**
```
GET /api/queries?lat=21.1458&lng=79.0882&radius=5
```

Returns queries within 5km of the specified location.

### Frontend Implementation
**Features:**
- Dropdown with preset radius options: 1km, 5km, 10km, 25km
- "All Queries" option to disable filter
- Automatic refetch when radius changes
- Uses user's current location for center point
- Real-time filter updates

**How It Works:**
1. User selects radius from dropdown
2. Frontend fetches user's current location
3. API call with lat/lng/radius parameters
4. MongoDB $near operator finds nearby queries
5. Map updates with filtered results

---

## 🔥 Feature 4: Heatmap View

### Backend Implementation
No backend changes required - uses existing query data.

### Frontend Implementation
**Files Added:**
- `src/HeatmapLayer.js` - Leaflet.heat integration component

**Dependencies:**
- `leaflet.heat` - Heatmap visualization library

**Features:**
- Toggle checkbox to enable/disable
- Color gradient (blue → green → yellow → red)
- Configurable intensity and radius
- Hides individual markers when active
- Real-time updates as queries are added

**Configuration:**
```javascript
L.heatLayer(points, {
  radius: 30,
  blur: 15,
  maxZoom: 17,
  max: 1.0,
  gradient: {
    0.0: 'blue',
    0.5: 'lime',
    0.7: 'yellow',
    1.0: 'red'
  }
})
```

**Use Cases:**
- Visualize popular query areas
- Identify hotspots of activity
- Better overview at zoomed-out levels
- Event density analysis

---

## 📱 Feature 5: Mobile Responsive Design

### Implementation
**Files Changed:**
- `src/index.css` - Extensive mobile-first CSS

**Breakpoints:**

#### Tablet (≤768px)
- Header switches to column layout
- Filters move to bottom of screen
- Stats panel repositioned
- Reduced font sizes

#### Mobile (≤480px)
- Compact header with smaller text
- Vertical filter layout with scrolling
- Narrower query popups (200px)
- Smaller buttons and inputs

#### Touch Devices
- Minimum touch target size: 44x44px
- Applied to all buttons, inputs, selects
- Improved tap accuracy

**Features:**
- Flexbox-based responsive layouts
- Touch-friendly UI elements
- Adaptive text sizing
- Optimized popup widths
- Bottom-sheet style controls on mobile
- Smooth animations and transitions
- Scrollable content areas

**Media Queries:**
```css
/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }

/* Touch devices */
@media (hover: none) and (pointer: coarse) { ... }
```

---

## 🎨 UI/UX Improvements

### Header
- Clean, modern design
- User profile display
- Login/Logout buttons
- Stats integration

### Filter Controls
- Grouped filter options
- Clear labels with emojis
- Dropdown for radius selection
- Checkbox for heatmap toggle

### Stats Panel
- Live user count
- Total query count
- Compact corner display

### Query Popups
- Clean header with user info
- Reply count badge
- Scrollable replies section
- Inline reply form
- Enter key support

### Visual Feedback
- Hover effects on buttons
- Focus states on inputs
- Smooth transitions
- Loading states
- Error messages

---

## 🔄 Real-Time Features

### Socket.IO Events

**Location Sharing:**
```javascript
// Send
socket.emit('send-location', { latitude, longitude, username });

// Receive
socket.on('receive-location', (data) => { ... });
```

**Query Broadcasting:**
```javascript
// Send
socket.emit('send-query', { lat, lng, text, user, userId });

// Receive
socket.on('receive-query', (query) => { ... });
```

**Reply Broadcasting:**
```javascript
// Send
socket.emit('send-reply', { queryId, text, username, userId });

// Receive
socket.on('receive-reply', ({ queryId, reply }) => { ... });
```

**User Disconnect:**
```javascript
socket.on('user-disconnected', (socketId) => {
  // Remove user from map
});
```

---

## 🔒 Security Features

### Password Security
- bcrypt hashing with 10 salt rounds
- No plain-text password storage
- Secure comparison method

### JWT Authentication
- 7-day token expiration
- Token stored in localStorage
- Bearer token in Authorization header
- Verified on protected routes

### API Protection
- `authenticateToken` - Blocks unauthenticated requests
- `optionalAuth` - Allows anonymous + authenticated users
- User ID linked to queries/replies

### Input Validation
- Required field checks
- Email format validation
- Password minimum length (6 chars)
- Unique username/email constraints

---

## 📊 Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required, lowercase),
  password: String (hashed, required),
  avatar: String (URL),
  bio: String,
  location: {
    type: "Point",
    coordinates: [Number, Number]
  },
  createdAt: Date
}
```

### Query Model
```javascript
{
  question: String (required),
  user: String,
  userId: ObjectId (ref: User),
  location: {
    type: "Point",
    coordinates: [Number, Number] // [lng, lat]
  },
  replies: [{
    text: String,
    userId: ObjectId,
    username: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

**Indexes:**
- `location: "2dsphere"` - Geospatial queries
- `username: unique` - User lookup
- `email: unique` - User lookup

---

## 🚀 Performance Optimizations

### Frontend
- React.useMemo for socket connection
- React.useCallback for event handlers
- Conditional rendering (heatmap vs markers)
- Efficient state updates
- Debounced geolocation updates

### Backend
- MongoDB geospatial indexing
- Efficient $near queries
- Limited result sets (50-100 queries)
- Populate only needed fields
- Connection pooling

### Real-Time
- WebSocket-only transport (no polling fallback)
- Broadcast instead of individual emits
- Efficient event payloads

---

## 🧪 Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Token persistence on refresh
- [ ] Logout clears token
- [ ] Protected routes require auth
- [ ] Invalid credentials rejected

### Replies
- [ ] Post reply to query
- [ ] Reply appears in real-time
- [ ] Reply count updates
- [ ] Scrollable reply list
- [ ] Anonymous replies work

### Nearby Queries
- [ ] Filter by 1km radius
- [ ] Filter by 5km radius
- [ ] Filter by 10km radius
- [ ] Filter by 25km radius
- [ ] "All Queries" shows everything
- [ ] Filter updates map in real-time

### Heatmap
- [ ] Toggle heatmap view
- [ ] Markers hidden when active
- [ ] Color gradient displays correctly
- [ ] Intensity reflects density
- [ ] Toggle back to markers

### Mobile
- [ ] Layout adapts on mobile
- [ ] Buttons are touch-friendly
- [ ] Controls accessible on small screens
- [ ] Popups readable on mobile
- [ ] Filters scrollable if needed

### Real-Time
- [ ] User locations update live
- [ ] New queries appear instantly
- [ ] Replies broadcast to all users
- [ ] User disconnect handled

---

## 📈 Future Enhancements

Potential features to add:
- Query categories/tags with color-coded markers
- Upvote/downvote system
- Search and filter queries by text
- User profile pages
- Notification system
- Image attachments in queries/replies
- Query expiration/archiving
- Admin moderation tools
- Analytics dashboard

---

## 🐛 Known Issues / Limitations

1. **Heatmap Performance:** Large number of queries (>1000) may impact performance
2. **Mobile Location:** Requires HTTPS for production geolocation
3. **Anonymous Users:** Can still post without accounts
4. **No Rate Limiting:** API endpoints not rate-limited yet
5. **Token Refresh:** No automatic token refresh (manual re-login required after 7 days)

---

Enjoy building with Huddle! 🌍✨
