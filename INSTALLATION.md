# 🚀 Huddle Installation Guide

## New Features Added:
1. ✅ **Authentication System** - User login/register with JWT
2. ✅ **Reply System** - Threaded conversations on queries
3. ✅ **Nearby Queries Filter** - Radius-based geospatial filtering
4. ✅ **Heatmap View** - Query density visualization
5. ✅ **Mobile Responsive Design** - Touch-optimized UI

---

## Installation Steps

### Step 1: Install Server Dependencies
```bash
cd server
npm install
```

**New Dependencies Added:**
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

---

### Step 2: Install Client Dependencies
```bash
cd ..
npm install
```

**New Dependencies Added:**
- `leaflet.heat` - Heatmap visualization

---

### Step 3: Update Environment Variables

Edit `server/.env` and add the JWT secret:

```env
MONGO_URI=your_mongodb_connection_string_here
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

---

### Step 4: Start the Server
```bash
cd server
node index.js
```

Wait for: **"Huddle Database Connected!"**

---

### Step 5: Start the Client
Open a new terminal:
```bash
npm start
```

Your browser will open `http://localhost:3000`

---

## 🎉 What's New?

### 1. Authentication
- Click **"Login / Register"** in the header
- Create an account or login
- Your queries will be linked to your profile
- Logout button when authenticated

### 2. Reply System
- Click on any **red query marker**
- See existing replies in the popup
- Type your reply in the input box
- Press **Enter** or click **Send**
- Real-time reply broadcasting to all users

### 3. Nearby Queries Filter
- Use the dropdown: "📍 Nearby Queries"
- Select radius: 1km, 5km, 10km, or 25km
- Only shows queries within that distance from your location
- Select "All Queries" to see everything

### 4. Heatmap View
- Toggle **"🔥 Heatmap View"** checkbox
- Visualizes query density with color gradients
  - Blue = Low density
  - Green/Yellow = Medium density
  - Red = High density
- Toggle off to return to marker view

### 5. Mobile Responsive
- Optimized layout for phones and tablets
- Touch-friendly buttons (minimum 44px height)
- Adaptive header and controls
- Bottom-positioned filters on mobile
- Scrollable replies section

---

## 📊 Stats Panel
Top-right corner shows:
- 👥 **Active Users** - Currently connected
- ❓ **Queries** - Total queries visible

---

## 🔒 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Change JWT_SECRET** in production
3. Passwords are hashed with bcrypt (10 salt rounds)
4. JWT tokens expire after 7 days

---

## 🛠️ Troubleshooting

**Issue:** "Cannot find module 'bcryptjs'"
- Solution: Run `cd server && npm install`

**Issue:** "Cannot find module 'leaflet.heat'"
- Solution: Run `npm install` in the root directory

**Issue:** Heatmap not showing
- Solution: Make sure there are multiple queries on the map
- Check browser console for errors

**Issue:** Authentication not working
- Solution: Check JWT_SECRET is set in server/.env
- Clear browser localStorage and try again

**Issue:** Replies not appearing
- Solution: Check server logs for errors
- Make sure Socket.IO connection is active

---

## 📱 Testing Mobile View

### In Chrome/Edge:
1. Press `F12` to open DevTools
2. Click the device toggle icon (Ctrl+Shift+M)
3. Select a mobile device from the dropdown
4. Test touch interactions

### On Real Device:
1. Find your computer's local IP (run `ipconfig` on Windows)
2. Update `socket` connection in `App.js` to use your IP
3. Update API fetch URLs to use your IP
4. Access from phone browser: `http://YOUR_IP:3000`

---

## 🎯 Next Steps

Try these features:
- [ ] Post a query on the map
- [ ] Reply to a query
- [ ] Switch to heatmap view
- [ ] Filter by nearby queries
- [ ] Create an account
- [ ] Test on mobile device

Enjoy your upgraded Huddle! 🌍
