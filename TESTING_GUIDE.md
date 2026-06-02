# 🧪 Huddle Testing Guide

## Overview
This guide helps you test all features of Huddle systematically.

---

## ✅ Pre-Testing Checklist

Before testing, ensure:
- [ ] Server is running (`node index.js` in server folder)
- [ ] Client is running (`npm start` in root folder)
- [ ] MongoDB connection successful ("Huddle Database Connected!")
- [ ] Browser location permissions granted
- [ ] Browser console open (F12) for debugging

---

## 🔐 1. Authentication System Testing

### Test 1.1: User Registration
**Steps:**
1. Open http://localhost:3000
2. Click "Login / Register" button
3. Click "Register" toggle
4. Fill in:
   - Username: testuser1
   - Email: test@example.com
   - Password: test123
5. Click "Register"

**Expected Result:**
- ✅ Modal closes
- ✅ Header shows "👤 testuser1"
- ✅ "Logout" button appears
- ✅ No error messages
- ✅ Token stored in localStorage

**Verification:**
```javascript
// Browser console:
localStorage.getItem('huddle_token')
// Should return a JWT token
```

### Test 1.2: User Login
**Steps:**
1. Click "Logout"
2. Click "Login / Register"
3. Enter:
   - Email: test@example.com
   - Password: test123
4. Click "Login"

**Expected Result:**
- ✅ Modal closes
- ✅ User logged in successfully
- ✅ Header shows username

### Test 1.3: Invalid Credentials
**Steps:**
1. Logout
2. Try login with wrong password

**Expected Result:**
- ✅ Error message: "Invalid credentials"
- ✅ Modal stays open
- ✅ Not logged in

### Test 1.4: Token Persistence
**Steps:**
1. Login successfully
2. Refresh page (F5)

**Expected Result:**
- ✅ User stays logged in
- ✅ Username still displayed
- ✅ No re-login required

### Test 1.5: Logout
**Steps:**
1. Click "Logout" button

**Expected Result:**
- ✅ User logged out
- ✅ "Login / Register" button appears
- ✅ Token removed from localStorage

---

## 💬 2. Reply System Testing

### Test 2.1: Post a Reply (Authenticated)
**Steps:**
1. Login as testuser1
2. Click any red query marker
3. In popup, type "This is my reply" in reply input
4. Press Enter (or click Send)

**Expected Result:**
- ✅ Reply appears in replies section
- ✅ Shows "testuser1: This is my reply"
- ✅ Reply count badge updates (+1)
- ✅ Input field clears
- ✅ Reply persists on popup close/reopen

### Test 2.2: Post a Reply (Anonymous)
**Steps:**
1. Logout
2. Click a query marker
3. Type and submit a reply

**Expected Result:**
- ✅ Reply posted as "Anonymous"
- ✅ Reply appears immediately

### Test 2.3: Multiple Replies
**Steps:**
1. Post 3 different replies to same query
2. Close popup
3. Reopen popup

**Expected Result:**
- ✅ All 3 replies visible
- ✅ Replies in chronological order
- ✅ Reply count shows "💬 3"

### Test 2.4: Real-Time Reply Broadcasting
**Steps:**
1. Open Huddle in 2 browser windows
2. In Window 1: Login as user1
3. In Window 2: Login as user2 (or stay anonymous)
4. Window 1: Post a reply
5. Window 2: Check the same query

**Expected Result:**
- ✅ Reply appears in Window 2 instantly
- ✅ No page refresh needed
- ✅ Reply count updates in both windows

### Test 2.5: Reply Scrolling
**Steps:**
1. Post 10+ replies to a query
2. Open the query popup

**Expected Result:**
- ✅ Replies section scrollable
- ✅ Scroll bar visible
- ✅ All replies accessible
- ✅ Reply input always visible at bottom

---

## 📍 3. Nearby Queries Filter Testing

### Test 3.1: Filter by 1km
**Steps:**
1. Note your current location
2. Select "Within 1 km" from filter dropdown

**Expected Result:**
- ✅ Only queries within 1km visible
- ✅ Map updates immediately
- ✅ Distant queries disappear

### Test 3.2: Filter by 5km, 10km, 25km
**Steps:**
1. Try each radius option
2. Note number of queries for each

**Expected Result:**
- ✅ More queries visible as radius increases
- ✅ Query count (in stats) updates
- ✅ Smooth transitions

### Test 3.3: All Queries
**Steps:**
1. Select "All Queries"

**Expected Result:**
- ✅ All queries from database visible
- ✅ No distance filtering applied

### Test 3.4: No Location Permission
**Steps:**
1. Block location in browser settings
2. Try to filter by radius

**Expected Result:**
- ✅ Falls back to "All Queries"
- OR shows error message

### Test 3.5: Post Query with Filter Active
**Steps:**
1. Set filter to "Within 5 km"
2. Click map to post a query
3. Submit query

**Expected Result:**
- ✅ New query appears on map
- ✅ Filter still active
- ✅ Query visible (within radius)

---

## 🔥 4. Heatmap View Testing

### Test 4.1: Enable Heatmap
**Steps:**
1. Ensure multiple queries on map
2. Check "🔥 Heatmap View" checkbox

**Expected Result:**
- ✅ Individual markers disappear
- ✅ Heatmap layer appears
- ✅ Color gradient visible (blue→green→yellow→red)
- ✅ Higher density areas are redder

### Test 4.2: Disable Heatmap
**Steps:**
1. Uncheck heatmap checkbox

**Expected Result:**
- ✅ Heatmap disappears
- ✅ Individual markers reappear
- ✅ Tooltips visible again

### Test 4.3: Heatmap with Few Queries
**Steps:**
1. Clear database (optional)
2. Post only 2-3 queries
3. Enable heatmap

**Expected Result:**
- ✅ Heatmap shows low intensity
- ✅ Mostly blue/green colors
- ✅ Small heat spots

### Test 4.4: Heatmap Zoom Levels
**Steps:**
1. Enable heatmap
2. Zoom in/out on map

**Expected Result:**
- ✅ Heatmap scales appropriately
- ✅ Density visible at all zoom levels
- ✅ Smooth transitions

### Test 4.5: Heatmap + Filter Combo
**Steps:**
1. Set filter to "Within 5 km"
2. Enable heatmap

**Expected Result:**
- ✅ Heatmap shows only filtered queries
- ✅ Both features work together
- ✅ Density reflects filtered data

---

## 📱 5. Mobile Responsive Testing

### Test 5.1: Tablet View (768px)
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPad or 768px width

**Expected Result:**
- ✅ Header switches to column layout
- ✅ Filters move to bottom
- ✅ Text sizes reduced
- ✅ All elements accessible

### Test 5.2: Mobile View (480px)
**Steps:**
1. Select iPhone or 480px width

**Expected Result:**
- ✅ Compact header
- ✅ Vertical filter layout
- ✅ Smaller popups (200px width)
- ✅ Touch-friendly buttons (44px min)

### Test 5.3: Touch Interactions
**Steps:**
1. In mobile view, test:
   - Tap map to post query
   - Tap markers to open popups
   - Tap buttons and inputs
   - Scroll replies section

**Expected Result:**
- ✅ All taps register correctly
- ✅ No accidental clicks
- ✅ Smooth scrolling

### Test 5.4: Landscape Orientation
**Steps:**
1. Rotate device/emulator to landscape

**Expected Result:**
- ✅ Layout adapts
- ✅ Controls still accessible
- ✅ Map visible

### Test 5.5: Real Device Testing
**Steps:**
1. Get your computer's IP: `ipconfig`
2. Update socket URL in App.js: `http://YOUR_IP:5000`
3. Update API URLs to use your IP
4. Access from phone: `http://YOUR_IP:3000`

**Expected Result:**
- ✅ App loads on phone
- ✅ Location works
- ✅ Real-time updates work
- ✅ Touch interactions smooth

---

## 🔄 6. Real-Time Features Testing

### Test 6.1: Location Broadcasting
**Steps:**
1. Open 2 browser windows
2. Window 1: Allow location
3. Window 2: Observe map

**Expected Result:**
- ✅ Window 1's marker appears in Window 2
- ✅ Marker updates as Window 1 moves (simulated)
- ✅ Username displays on marker

### Test 6.2: Query Broadcasting
**Steps:**
1. Window 1: Click map, post query
2. Window 2: Watch map

**Expected Result:**
- ✅ Query appears in Window 2 instantly
- ✅ No refresh needed
- ✅ Marker and tooltip appear

### Test 6.3: Reply Broadcasting
**Steps:**
1. Window 1: Open a query, post reply
2. Window 2: Have same query popup open

**Expected Result:**
- ✅ Reply appears in Window 2
- ✅ Reply count updates in both
- ✅ Instant synchronization

### Test 6.4: User Disconnect
**Steps:**
1. Close Window 1
2. Watch Window 2

**Expected Result:**
- ✅ Window 1's user marker disappears
- ✅ Active user count decreases
- ✅ Clean removal (no errors)

---

## 🎨 7. UI/UX Testing

### Test 7.1: Header
- [ ] Username displays correctly
- [ ] Login/Logout button works
- [ ] Header responsive on mobile
- [ ] Instructions visible

### Test 7.2: Filter Controls
- [ ] Dropdown changes radius
- [ ] Checkbox toggles heatmap
- [ ] Labels clear and readable
- [ ] Controls accessible on mobile

### Test 7.3: Stats Panel
- [ ] Active user count accurate
- [ ] Query count updates
- [ ] Visible in corner

### Test 7.4: Query Popups
- [ ] Username displays
- [ ] Reply count badge shows
- [ ] Replies scrollable
- [ ] Reply form functional
- [ ] Popup closes properly

### Test 7.5: Modals
- [ ] Login modal opens/closes
- [ ] Form validation works
- [ ] Error messages display
- [ ] Modal responsive

---

## 🐛 8. Error Handling Testing

### Test 8.1: Network Errors
**Steps:**
1. Stop server
2. Try to post query or reply

**Expected Result:**
- ✅ Error logged in console
- ✅ App doesn't crash
- ✅ User sees feedback (if implemented)

### Test 8.2: Invalid Input
**Steps:**
1. Try register with:
   - Empty fields
   - Invalid email
   - Short password (<6 chars)

**Expected Result:**
- ✅ Form validation prevents submit
- ✅ Error messages shown

### Test 8.3: MongoDB Disconnection
**Steps:**
1. Stop MongoDB service
2. Restart server
3. Try operations

**Expected Result:**
- ✅ Server logs connection error
- ✅ Graceful degradation

### Test 8.4: Socket.IO Disconnection
**Steps:**
1. Open DevTools Network tab
2. Simulate offline
3. Try real-time operations

**Expected Result:**
- ✅ Socket reconnects when online
- ✅ No app crash

---

## 📊 9. Database Testing

### Test 9.1: Query Persistence
**Steps:**
1. Post several queries
2. Refresh page

**Expected Result:**
- ✅ All queries reload from DB
- ✅ Replies included
- ✅ Correct locations

### Test 9.2: User Persistence
**Steps:**
1. Register user
2. Restart server
3. Login

**Expected Result:**
- ✅ User data preserved
- ✅ Login successful

### Test 9.3: Geospatial Index
**Steps:**
1. Post queries at various locations
2. Test radius filters

**Expected Result:**
- ✅ Queries filtered by distance
- ✅ Fast query response (<500ms)

---

## 🔒 10. Security Testing

### Test 10.1: Password Hashing
**Steps:**
1. Register user
2. Check MongoDB directly

**Expected Result:**
- ✅ Password is hashed (not plain text)
- ✅ bcrypt hash format

### Test 10.2: JWT Protection
**Steps:**
1. Try to access `/api/auth/me` without token

**Expected Result:**
- ✅ 401 Unauthorized response
- ✅ "Access token required" message

### Test 10.3: Token Expiration
**Steps:**
1. Manually set expired token in localStorage
2. Refresh page

**Expected Result:**
- ✅ Token rejected
- ✅ User logged out
- ✅ Redirect to login

---

## 📝 Test Report Template

```markdown
## Test Session Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Windows 11, Chrome 120

### Features Tested:
- [x] Authentication System - ✅ Pass
- [x] Reply System - ✅ Pass
- [x] Nearby Queries - ⚠️ Issue found
- [ ] Heatmap View - Not tested
- [x] Mobile Responsive - ✅ Pass

### Issues Found:
1. **Nearby filter not working with denied location**
   - Severity: Medium
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

### Recommendations:
- Add error message for location denial
- Improve mobile popup sizing

### Overall Status: ✅ Ready for Production / ⚠️ Needs Work / ❌ Critical Issues
```

---

## 🎯 Automated Testing (Future)

Consider adding:
- Jest unit tests
- Cypress E2E tests
- Socket.IO event testing
- API endpoint testing with Supertest
- MongoDB integration tests

---

## 📚 Additional Testing Resources

- **Chrome DevTools:** Network tab for API debugging
- **React DevTools:** Component state inspection
- **MongoDB Compass:** Database inspection
- **Postman:** API endpoint testing

---

**Happy Testing! 🚀**
