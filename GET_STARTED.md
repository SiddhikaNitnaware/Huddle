# 🚀 Get Started with Huddle

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies (2 min)
```bash
# Run the automated setup script
setup.bat
```

OR manually:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ..
npm install
```

### Step 2: Configure Environment (1 min)
Edit `server/.env`:
```env
MONGO_URI=mongodb+srv://your_username:password@cluster.mongodb.net/huddle
PORT=5000
JWT_SECRET=change_this_to_a_random_secure_string_in_production
```

**Need MongoDB?** Get free hosting at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Step 3: Start the Application (2 min)

**Terminal 1 - Start Server:**
```bash
cd server
node index.js
```
✅ Wait for: **"Huddle Database Connected!"**

**Terminal 2 - Start Client:**
```bash
npm start
```
✅ Browser opens at: **http://localhost:3000**

---

## 🎯 What You Get

### 5 Major Features
1. 🔐 **User Authentication** - Secure login/register with JWT
2. 💬 **Reply System** - Threaded conversations on queries
3. 📍 **Nearby Queries** - Filter by 1km, 5km, 10km, 25km
4. 🔥 **Heatmap View** - Visualize query density
5. 📱 **Mobile Responsive** - Optimized for all devices

---

## 📖 First-Time User Guide

### 1. Allow Location (Important!)
- Browser will ask for location permission
- Click **"Allow"** for full features
- Required for nearby queries and location sharing

### 2. Create an Account (Optional)
- Click **"Login / Register"** in header
- Fill in username, email, password
- Click **"Register"**
- You're now authenticated!

### 3. Post Your First Query
- Click anywhere on the map
- Type your question in the prompt
- Your query appears as a red marker

### 4. Reply to Queries
- Click any red marker
- See the query and existing replies
- Type your reply and press Enter

### 5. Try the Filters
- **Nearby Queries:** Dropdown in left panel
  - Try "Within 5 km" to see only nearby queries
- **Heatmap View:** Check the box
  - Visualize query density with colors

---

## 📱 Mobile Testing

### On Your Phone
1. Get your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update URLs in `src/App.js`:
   ```javascript
   // Change from:
   const socket = io("http://localhost:5000");
   
   // To:
   const socket = io("http://192.168.1.100:5000");
   
   // Also update fetch URLs:
   fetch("http://192.168.1.100:5000/api/queries")
   ```

3. Access from phone browser:
   ```
   http://192.168.1.100:3000
   ```

---

## 🐛 Troubleshooting

### "Cannot find module 'bcryptjs'"
```bash
cd server
npm install
```

### "Cannot find module 'leaflet.heat'"
```bash
npm install
```

### Authentication Not Working
- Check `JWT_SECRET` is set in `server/.env`
- Clear browser localStorage: `localStorage.clear()`
- Restart server

### Queries Not Loading
- Check MongoDB connection in server logs
- Verify `MONGO_URI` in `server/.env`
- Check MongoDB Atlas network access (allow your IP)

### Location Not Working
- Click browser's lock icon in address bar
- Select "Site settings"
- Allow location permissions
- Refresh page

### Server Won't Start
- Check if port 5000 is already in use
- Try different port in `.env`: `PORT=5001`
- Update client Socket.IO URL accordingly

---

## 📚 Learn More

### Essential Docs
- **[README.md](README.md)** - Project overview
- **[INSTALLATION.md](INSTALLATION.md)** - Detailed setup
- **[FEATURES.md](FEATURES.md)** - Complete feature docs

### Developer Resources
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - API & code reference
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing procedures
- **[CHANGELOG.md](CHANGELOG.md)** - What's new

---

## 🎮 Try These Features

### Authentication
- [ ] Register a new account
- [ ] Login with credentials
- [ ] View your profile in header
- [ ] Logout and login again

### Queries & Replies
- [ ] Post a query on the map
- [ ] Click a query to see details
- [ ] Reply to someone's query
- [ ] Post multiple replies

### Filters & Views
- [ ] Filter queries by 5km radius
- [ ] Try different radius options
- [ ] Toggle heatmap view on/off
- [ ] See query density visualization

### Mobile Experience
- [ ] Open on mobile device
- [ ] Test touch interactions
- [ ] Try posting from phone
- [ ] Check responsive layout

### Real-Time Features
- [ ] Open in 2 browser windows
- [ ] Post in one, see in other
- [ ] Test real-time replies
- [ ] Watch user locations update

---

## 🚀 Production Deployment

### Before Deploying:
1. ✅ Change `JWT_SECRET` to strong random string
2. ✅ Update CORS settings for your domain
3. ✅ Use production MongoDB cluster
4. ✅ Enable HTTPS (required for geolocation)
5. ✅ Update Socket.IO and API URLs
6. ✅ Set up environment variables
7. ✅ Add rate limiting
8. ✅ Configure logging and monitoring

### Deployment Options:
- **Heroku** - Easy deployment with free tier
- **Vercel** - Great for React apps
- **AWS/Azure** - Full control and scaling
- **DigitalOcean** - Simple VPS option

---

## 💡 Tips & Best Practices

### For Users:
- **Allow Location:** Essential for nearby queries
- **Create Account:** Get username on your queries
- **Be Respectful:** Keep queries appropriate
- **Use Filters:** Find relevant queries nearby
- **Try Heatmap:** See popular areas

### For Developers:
- **Check Browser Console:** For debugging
- **MongoDB Compass:** Inspect database
- **React DevTools:** Debug components
- **Network Tab:** Monitor API calls
- **Test on Mobile:** Real device testing important

---

## 🎯 What's Next?

### Immediate (Day 1)
1. Install and run the app ✅
2. Test all 5 features
3. Try on mobile device
4. Read documentation

### Short-term (Week 1)
- Customize for your use case
- Add your MongoDB database
- Test with friends
- Report any issues

### Long-term (Month 1)
- Deploy to production
- Add custom features
- Scale infrastructure
- Monitor usage

---

## 🤝 Get Help

### Common Questions
- **"How do I get MongoDB?"** - Free at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **"Can I use without authentication?"** - Yes, anonymous mode works
- **"Does it work on iPhone?"** - Yes, full mobile support
- **"How many users can it handle?"** - Scales with MongoDB and server

### Need Support?
- Read [INSTALLATION.md](INSTALLATION.md) for setup issues
- Check [FEATURES.md](FEATURES.md) for feature details
- See [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing
- Review [TROUBLESHOOTING](#-troubleshooting) above

---

## ✅ Quick Checklist

Before you start:
- [ ] Node.js installed (14+)
- [ ] MongoDB account (free)
- [ ] Text editor ready
- [ ] Browser with location support

After installation:
- [ ] Server running without errors
- [ ] Client opens in browser
- [ ] Location permission granted
- [ ] Can see the map

First actions:
- [ ] Post a query
- [ ] Create an account
- [ ] Try filters
- [ ] Enable heatmap
- [ ] Test on mobile

---

## 🎉 You're Ready!

Run this command to start:
```bash
setup.bat
```

Then follow the prompts!

**Welcome to Huddle - Ask the World! 🌍**

---

**Questions?** Check the documentation files listed above!
**Issues?** See [Troubleshooting](#-troubleshooting)!
**Ready to code?** Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)!
