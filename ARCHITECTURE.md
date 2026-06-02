# 🏗️ Huddle Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   App.js    │  │ AuthContext  │  │   Components     │  │
│  │ (Main Map)  │  │ (Auth State) │  │ (Login, Heatmap) │  │
│  └─────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│        │                  │                    │             │
│        └──────────────────┴────────────────────┘             │
│                           ↓                                  │
│        ┌──────────────────────────────────────┐             │
│        │    Socket.IO Client + REST API       │             │
│        └───────────────┬──────────────────────┘             │
└────────────────────────┼───────────────────────────────────┘
                         │
                    HTTP/WebSocket
                         │
┌────────────────────────┼───────────────────────────────────┐
│                        ↓                                    │
│        ┌──────────────────────────────────────┐            │
│        │         Express Server (5000)         │            │
│        │  - REST API Endpoints                 │            │
│        │  - Socket.IO Server                   │            │
│        │  - JWT Authentication                 │            │
│        └───────────┬──────────┬────────────────┘            │
│                    │          │                             │
│           ┌────────┴────┐  ┌──┴──────┐                     │
│           │  Auth       │  │ Socket  │                      │
│           │  Middleware │  │ Handlers│                      │
│           └────────┬────┘  └──┬──────┘                     │
│                    │          │                             │
│                    └──────┬───┘                             │
│                           ↓                                 │
│        ┌──────────────────────────────────────┐            │
│        │        MongoDB Database               │            │
│        │  - Users Collection                   │            │
│        │  - Queries Collection (with replies)  │            │
│        │  - 2dsphere Geospatial Index          │            │
│        └───────────────────────────────────────┘            │
│                      SERVER                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend (React)

```
src/
├── App.js
│   ├── HuddleMap (main component)
│   │   ├── MapContainer (react-leaflet)
│   │   ├── TileLayer
│   │   ├── Markers (users & queries)
│   │   ├── Popups (with replies)
│   │   └── HeatmapLayer (conditional)
│   │
│   ├── Header
│   │   ├── User Profile
│   │   └── Auth Buttons
│   │
│   ├── Filter Controls
│   │   ├── Radius Dropdown
│   │   └── Heatmap Toggle
│   │
│   └── Stats Panel
│
├── AuthContext.js
│   ├── Login Function
│   ├── Register Function
│   ├── Logout Function
│   └── User State
│
├── LoginModal.js
│   ├── Login Form
│   └── Register Form
│
└── HeatmapLayer.js
    └── Leaflet.heat Integration
```

### Backend (Node.js + Express)

```
server/
├── index.js (main server)
│   ├── Express Routes
│   │   ├── POST /api/auth/register
│   │   ├── POST /api/auth/login
│   │   ├── GET  /api/auth/me (protected)
│   │   ├── PUT  /api/auth/profile (protected)
│   │   ├── GET  /api/queries
│   │   └── POST /api/queries/:id/reply
│   │
│   └── Socket.IO Events
│       ├── send-location / receive-location
│       ├── send-query / receive-query
│       ├── send-reply / receive-reply
│       └── user-disconnected
│
├── User.js (Mongoose model)
│   ├── username, email, password (hashed)
│   ├── avatar, bio
│   ├── location (GeoJSON)
│   └── comparePassword method
│
├── Query.js (Mongoose model)
│   ├── question, user, userId
│   ├── location (GeoJSON Point)
│   ├── replies (array)
│   │   ├── text, username, userId
│   │   └── createdAt
│   └── 2dsphere index
│
└── authMiddleware.js
    ├── authenticateToken (required auth)
    └── optionalAuth (optional auth)
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Client  │                │  Server  │                │ MongoDB  │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ POST /api/auth/register   │                           │
     │ {username, email, pass}   │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ Check if user exists      │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ Hash password (bcrypt)    │
     │                           │                           │
     │                           │ Save user                 │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ Generate JWT token        │
     │                           │                           │
     │<──────────────────────────┤                           │
     │ {token, user}             │                           │
     │                           │                           │
     │ Store token in localStorage                           │
     │                           │                           │
```

### 2. Query Posting Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Client  │                │  Server  │                │ MongoDB  │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ User clicks map           │                           │
     │ socket.emit('send-query') │                           │
     ├──────────────────────────>│                           │
     │ {lat, lng, text, user}    │                           │
     │                           │                           │
     │                           │ Create Query document     │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ io.emit('receive-query')  │
     │<──────────────────────────┤ (broadcast to all)        │
     │                           │                           │
     │ Add marker to map         │                           │
     │                           │                           │
```

### 3. Reply System Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Client  │                │  Server  │                │ MongoDB  │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ User types reply          │                           │
     │ socket.emit('send-reply') │                           │
     ├──────────────────────────>│                           │
     │ {queryId, text, username} │                           │
     │                           │                           │
     │                           │ Find query by ID          │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ Push reply to array       │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ io.emit('receive-reply')  │
     │<──────────────────────────┤ (broadcast to all)        │
     │                           │                           │
     │ Update popup with reply   │                           │
     │                           │                           │
```

### 4. Nearby Queries Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Client  │                │  Server  │                │ MongoDB  │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ User selects radius       │                           │
     │ (e.g., 5km)               │                           │
     │                           │                           │
     │ GET /api/queries          │                           │
     │ ?lat=21.1&lng=79.0        │                           │
     │ &radius=5                 │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ Query.find({             │
     │                           │   location: {             │
     │                           │     $near: {              │
     │                           │       $geometry: {...},   │
     │                           │       $maxDistance: 5000  │
     │                           │     }                     │
     │                           │   }                       │
     │                           │ })                        │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │ Queries within 5km        │
     │                           │                           │
     │<──────────────────────────┤                           │
     │ Update map with filtered  │                           │
     │ queries                   │                           │
     │                           │                           │
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId("673abc..."),
  username: "john_doe",
  email: "john@example.com",
  password: "$2a$10$hashed...",  // bcrypt hash
  avatar: "https://...",
  bio: "Huddle enthusiast",
  location: {
    type: "Point",
    coordinates: [79.0882, 21.1458]  // [lng, lat]
  },
  createdAt: ISODate("2024-06-02T...")
}
```

**Indexes:**
- `{ email: 1 }` - Unique
- `{ username: 1 }` - Unique

### Queries Collection

```javascript
{
  _id: ObjectId("673def..."),
  question: "Where's the best coffee?",
  user: "john_doe",
  userId: ObjectId("673abc..."),
  location: {
    type: "Point",
    coordinates: [79.0882, 21.1458]  // [lng, lat]
  },
  replies: [
    {
      _id: ObjectId("673xyz..."),
      text: "Try Cafe Express!",
      username: "jane_smith",
      userId: ObjectId("673pqr..."),
      createdAt: ISODate("2024-06-02T...")
    }
  ],
  createdAt: ISODate("2024-06-02T...")
}
```

**Indexes:**
- `{ location: "2dsphere" }` - Geospatial queries

---

## State Management

### Frontend State (React)

```javascript
// Authentication State (AuthContext)
{
  user: {
    id: "673abc...",
    username: "john_doe",
    email: "john@example.com",
    avatar: null,
    bio: ""
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  isAuthenticated: true,
  loading: false
}

// Map State (HuddleMap component)
{
  users: {
    "socketId1": {
      latitude: 21.1458,
      longitude: 79.0882,
      username: "user1"
    }
  },
  queries: [
    {
      _id: "673def...",
      lat: 21.1458,
      lng: 79.0882,
      text: "Question text",
      user: "john_doe",
      userId: "673abc...",
      timestamp: Date,
      replies: [...]
    }
  ],
  userLocation: { lat: 21.1458, lng: 79.0882 },
  radiusFilter: 5,  // km
  showHeatmap: false,
  selectedQuery: "673def...",
  replyText: ""
}
```

---

## Security Architecture

### Authentication Layer

```
Request Flow:
1. Client sends request with JWT token
2. authMiddleware.authenticateToken() verifies
3. If valid: Attach user to req.user, continue
4. If invalid: Return 403 Forbidden
5. Protected route handler executes

Token Structure:
{
  id: "673abc...",
  username: "john_doe",
  email: "john@example.com",
  iat: 1717329600,  // Issued at
  exp: 1717934400   // Expires (7 days)
}
```

### Password Security

```
Registration:
1. User submits password
2. bcrypt.genSalt(10) generates salt
3. bcrypt.hash(password, salt) hashes
4. Store hashed password only

Login:
1. User submits password
2. Find user by email
3. bcrypt.compare(password, hashedPassword)
4. If match: Generate JWT
5. If no match: Return error
```

---

## Real-Time Communication

### Socket.IO Events

```javascript
// Client Events (Emitted by Client)
socket.emit('send-location', {
  latitude: 21.1458,
  longitude: 79.0882,
  username: 'john_doe'
});

socket.emit('send-query', {
  lat: 21.1458,
  lng: 79.0882,
  text: 'Question?',
  user: 'john_doe',
  userId: '673abc...'
});

socket.emit('send-reply', {
  queryId: '673def...',
  text: 'Reply text',
  username: 'john_doe',
  userId: '673abc...'
});

// Server Events (Broadcasted by Server)
io.emit('receive-location', {
  id: 'socketId',
  latitude: 21.1458,
  longitude: 79.0882,
  username: 'john_doe'
});

io.emit('receive-query', {
  _id: '673def...',
  lat: 21.1458,
  lng: 79.0882,
  text: 'Question?',
  user: 'john_doe',
  userId: '673abc...',
  timestamp: Date,
  replies: []
});

io.emit('receive-reply', {
  queryId: '673def...',
  reply: {
    text: 'Reply text',
    username: 'john_doe',
    userId: '673abc...',
    createdAt: Date
  }
});

io.emit('user-disconnected', 'socketId');
```

---

## Performance Considerations

### Frontend Optimizations
- **React.useMemo:** Socket connection cached
- **React.useCallback:** Event handlers memoized
- **Conditional Rendering:** Heatmap vs markers
- **Efficient Updates:** State batching

### Backend Optimizations
- **MongoDB Indexing:** 2dsphere for geospatial
- **Query Limits:** 50-100 results max
- **Connection Pooling:** Mongoose default
- **Broadcast vs Emit:** io.emit for all users

### Network Optimizations
- **WebSocket:** Persistent connections
- **Event Batching:** Grouped updates
- **Payload Minimization:** Only essential data

---

## Scalability

### Horizontal Scaling
```
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Client  │   │ Client  │   │ Client  │
└────┬────┘   └────┬────┘   └────┬────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
            Load Balancer
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼────┐   ┌───▼─────┐   ┌──▼──────┐
│ Server1 │   │ Server2 │   │ Server3 │
└────┬────┘   └────┬────┘   └────┬────┘
     └─────────────┼─────────────┘
                   │
              Redis (for
            Socket.IO sync)
                   │
            MongoDB Cluster
```

### Database Scaling
- **Sharding:** By location (geo-partitioning)
- **Replication:** Read replicas for queries
- **Indexing:** 2dsphere for geospatial
- **Caching:** Redis for hot queries

---

## Deployment Architecture

```
┌────────────────────────────────────────┐
│          CDN (Static Assets)           │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│         Load Balancer (HTTPS)          │
└───────┬────────────────┬───────────────┘
        │                │
┌───────▼──────┐  ┌──────▼───────┐
│  Server 1    │  │  Server 2    │
│  (Node.js)   │  │  (Node.js)   │
└───────┬──────┘  └──────┬───────┘
        │                │
        └────────┬───────┘
                 │
┌────────────────▼────────────────┐
│     MongoDB Atlas Cluster       │
│  (M10+, Multi-Region Replica)   │
└─────────────────────────────────┘
```

---

**For more details, see:**
- [FEATURES.md](FEATURES.md) - Feature documentation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - API reference
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details
