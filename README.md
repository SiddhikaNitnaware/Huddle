# 📍 Huddle: Ask the World!

Huddle is a live map where you can ask questions and people near you can answer instantly!

## ✨ Features

### Core Features
- **📍 Real-Time Location Sharing** - See active users on the map
- **❓ Location-Based Queries** - Click anywhere to post questions
- **⚡ Instant Updates** - Socket.IO powered real-time communication
- **💾 Persistent Storage** - All queries saved in MongoDB

### New Features ✨
- **🔐 User Authentication** - Secure login/register with JWT
- **💬 Reply System** - Threaded conversations on queries
- **📍 Nearby Queries** - Filter by radius (1km, 5km, 10km, 25km)
- **🔥 Heatmap View** - Visualize query density
- **📱 Mobile Responsive** - Optimized for all devices

## 🛠️ Tech Stack
- **Frontend:** React 18 & Leaflet (Interactive Maps)
- **Backend:** Node.js & Express
- **Real-Time:** Socket.IO
- **Database:** MongoDB with Geospatial Indexing
- **Authentication:** JWT + bcrypt
- **Visualization:** Leaflet.heat

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MongoDB Atlas account (free tier works!)

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd Huddle
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ..
npm install
```

### 3. Configure Environment

Create `server/.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_super_secret_key_change_in_production
```

### 4. Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
node index.js
```
Wait for: **"Huddle Database Connected!"**

**Terminal 2 - Start Client:**
```bash
npm start
```

Your browser opens at `http://localhost:3000` 🎉

---

## 📖 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Detailed setup guide
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation
- **API Endpoints** - See FEATURES.md for API reference

---

## 🎯 How to Use

1. **Allow Location Access** when prompted
2. **Login/Register** for full features (optional for browsing)
3. **Click anywhere** on the map to post a query
4. **Click red markers** to see queries and replies
5. **Type and press Enter** to reply to queries
6. **Use filters** to find nearby queries
7. **Toggle heatmap** to see query density

---

## 🌟 Feature Highlights

### Authentication System
- Secure JWT-based authentication
- Persistent login with localStorage
- Optional anonymous mode
- User profiles with avatars

### Reply System
- Real-time threaded conversations
- Reply count badges on markers
- Scrollable reply history
- Anonymous replies supported

### Nearby Queries
- Geospatial filtering by radius
- 1km, 5km, 10km, 25km presets
- Uses MongoDB $near operator
- Real-time filter updates

### Heatmap View
- Query density visualization
- Color-coded intensity (blue → red)
- Toggle between markers and heatmap
- Smooth transitions

### Mobile Responsive
- Touch-optimized UI (44px touch targets)
- Adaptive layouts for all screen sizes
- Bottom-positioned controls on mobile
- Optimized popups for small screens

---

## 📱 Mobile Access

### Local Network Testing
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update Socket.IO URL in `src/App.js`:
   ```javascript
   const socket = io("http://YOUR_IP:5000");
   ```
3. Update API URLs to use your IP
4. Access from phone: `http://YOUR_IP:3000`

### Production Deployment
- Requires HTTPS for geolocation
- Update CORS settings for your domain
- Set strong JWT_SECRET
- Use environment variables

---

## 🔒 Security

- **Passwords**: bcrypt hashing (10 salt rounds)
- **Authentication**: JWT tokens (7-day expiry)
- **API Protection**: Middleware authentication
- **Input Validation**: Server-side validation
- **No Secrets Committed**: `.env` in `.gitignore`

**Important:** Change `JWT_SECRET` in production!

---

## 🧪 Testing

Run these checks:
- [ ] Register and login
- [ ] Post a query
- [ ] Reply to a query
- [ ] Filter by nearby queries
- [ ] Toggle heatmap view
- [ ] Test on mobile device
- [ ] Check real-time updates

---

## 📊 Database Schema

### Collections
- **users** - User accounts with authentication
- **queries** - Location-based questions with replies

### Indexes
- `queries.location` - 2dsphere geospatial index
- `users.email` - Unique index
- `users.username` - Unique index

---

## 🐛 Troubleshooting

**Problem:** "Cannot find module 'bcryptjs'"
- **Solution:** `cd server && npm install`

**Problem:** Heatmap not showing
- **Solution:** Ensure `npm install` in root directory

**Problem:** Authentication not working
- **Solution:** Check `JWT_SECRET` in server/.env

**Problem:** Location not updating
- **Solution:** Allow location permissions in browser

**Problem:** Queries not appearing
- **Solution:** Check MongoDB connection in server logs

---

## 🚧 Future Roadmap

- [ ] Query categories/tags
- [ ] Upvote/downvote system
- [ ] Search functionality
- [ ] Push notifications
- [ ] Image attachments
- [ ] User profiles page
- [ ] Admin moderation
- [ ] Analytics dashboard
- [ ] Rate limiting
- [ ] Token refresh

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

---

## 📞 Support

Questions or issues? Check:
- [INSTALLATION.md](INSTALLATION.md) for setup help
- [FEATURES.md](FEATURES.md) for feature details
- GitHub Issues for bug reports

---

**Built with ❤️ for real-time location-based Q&A**

🌍 Ask the World with Huddle!
