# Changelog

All notable changes to Huddle are documented in this file.

## [2.0.0] - 2024-06-02

### 🎉 Major Release - 5 New Features

### Added

#### 1. Authentication System 🔐
- **Backend:**
  - New User model with password hashing (bcrypt)
  - JWT authentication middleware
  - Register endpoint (`POST /api/auth/register`)
  - Login endpoint (`POST /api/auth/login`)
  - Profile endpoint (`GET /api/auth/me`)
  - Update profile endpoint (`PUT /api/auth/profile`)
  - 7-day JWT token expiration
  - Password validation (minimum 6 characters)
  
- **Frontend:**
  - AuthContext for global state management
  - LoginModal component with register/login toggle
  - Persistent authentication with localStorage
  - User profile display in header
  - Logout functionality
  - Error handling and validation messages

#### 2. Reply System 💬
- **Backend:**
  - Reply sub-schema in Query model
  - Reply endpoint (`POST /api/queries/:queryId/reply`)
  - Real-time reply broadcasting via Socket.IO
  - `send-reply` and `receive-reply` events
  - User linking to replies
  
- **Frontend:**
  - Reply input in query popups
  - Scrollable replies section
  - Reply count badge on markers
  - Real-time reply updates
  - Enter key to submit replies
  - Anonymous reply support

#### 3. Nearby Queries Filter 📍
- **Backend:**
  - Geospatial query with MongoDB `$near` operator
  - Radius parameter in `/api/queries` endpoint
  - Distance calculation in meters
  - Query limit (100 results)
  
- **Frontend:**
  - Radius filter dropdown
  - Preset options: 1km, 5km, 10km, 25km, All
  - User location tracking
  - Automatic refetch on radius change
  - Real-time filter updates

#### 4. Heatmap View 🔥
- **Frontend:**
  - New HeatmapLayer component
  - Leaflet.heat integration
  - Color gradient visualization (blue → red)
  - Toggle checkbox in controls
  - Configurable intensity and radius
  - Hide markers when heatmap active
  - Smooth transitions

#### 5. Mobile Responsive Design 📱
- **Frontend:**
  - Mobile-first CSS architecture
  - Responsive breakpoints (768px, 480px)
  - Touch-friendly UI (44px minimum touch targets)
  - Adaptive header layout
  - Bottom-positioned controls on mobile
  - Optimized popup widths
  - Scrollable filter controls
  - Improved text sizing for readability

### Changed

#### Backend
- Updated Query schema to include `userId` and `replies`
- Modified `/api/queries` endpoint to support filtering
- Enhanced Socket.IO query emission with user data
- Added `optionalAuth` middleware for hybrid routes
- Populated user data in query responses

#### Frontend
- Complete App.js refactor with authentication integration
- Enhanced query popups with reply functionality
- New header design with auth controls
- Filter controls UI with grouped options
- Stats panel with user/query counts
- Updated index.css with comprehensive responsive styles

#### Dependencies
- **Server:** Added `bcryptjs`, `jsonwebtoken`
- **Client:** Added `leaflet.heat`

### Files Added

#### Backend
- `server/User.js` - User model with authentication
- `server/authMiddleware.js` - JWT verification middleware

#### Frontend
- `src/AuthContext.js` - Authentication state management
- `src/LoginModal.js` - Login/Register modal component
- `src/LoginModal.css` - Modal styling
- `src/HeatmapLayer.js` - Heatmap visualization component

#### Documentation
- `INSTALLATION.md` - Comprehensive setup guide
- `FEATURES.md` - Detailed feature documentation
- `CHANGELOG.md` - Version history
- `setup.bat` - Automated Windows setup script

### Security
- Implemented bcrypt password hashing (10 salt rounds)
- JWT token-based authentication
- Protected API routes with middleware
- Input validation on authentication endpoints
- Secure password comparison methods
- Environment variable for JWT secret

### Performance
- MongoDB geospatial indexing for efficient queries
- Limited query result sets (50-100)
- Optimized Socket.IO events
- React.useMemo and useCallback hooks
- Efficient state management

### UI/UX Improvements
- Modern header with profile integration
- Clean filter controls with emojis
- Reply count badges on markers
- Scrollable replies with custom scrollbar
- Smooth animations and transitions
- Error message displays
- Loading states
- Hover effects and focus states

---

## [1.0.0] - Initial Release

### Added
- Real-time location sharing with Socket.IO
- Interactive Leaflet map with Nagpur center
- Query posting on map clicks
- Live user markers on map
- Query markers with tooltips
- MongoDB persistence
- Geospatial 2dsphere indexing
- User location tracking with navigator.geolocation
- Query history loading on join
- User disconnect handling
- Basic responsive layout

### Backend
- Express server setup
- Socket.IO integration
- MongoDB connection with Mongoose
- Query model with location schema
- CORS configuration
- Environment variable support

### Frontend
- React 18 application
- React-Leaflet map integration
- Socket.IO client connection
- Custom marker icons
- Query tooltips
- User presence display
- Geolocation API integration

---

## Future Versions (Planned)

### [2.1.0] - Planned
- Query categories/tags
- Upvote/downvote system
- Search functionality
- User profile pages
- Query expiration

### [2.2.0] - Planned
- Push notifications
- Image attachments
- Admin moderation tools
- Analytics dashboard
- Rate limiting

### [3.0.0] - Planned
- WebRTC video calls
- Group chat rooms
- Events and meetups
- Advanced privacy settings
- Multi-language support

---

## Version Guidelines

- **Major (X.0.0):** Breaking changes, major new features
- **Minor (x.Y.0):** New features, backward compatible
- **Patch (x.y.Z):** Bug fixes, minor improvements
