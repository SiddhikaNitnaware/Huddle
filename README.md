# 📍 Huddle: Ask the World!

Huddle is a live map! Ask a question, and people near you can answer it instantly.

## 🛠️ Tech Stuff
- **Frontend:** React & Leaflet (Map)
- **Backend:** Node.js & Express
- **Real-Time:** Socket.IO
- **Database:** MongoDB Atlas

---

## 🚀 How to run it on ANY computer!

It is super easy to start. Just follow these steps!

### 1. Set up the Secret File (`.env`)
The server needs a secret key to save data. We use a `.env` file for this.

1. Go into the `server` folder.
2. Create a new file named exactly `.env`.
3. Copy and paste this inside:
   ```text
   MONGO_URI=your_mongodb_connection_string_here
   PORT=5000
   ```
---

### 2. Run the Server (The Brain)
Open your terminal, go to the `server` folder, and type:
```bash
cd server
npm install
node index.js
```
✅ Wait until you see the magic words: **"Huddle Database Connected!"**

---

### 3. Run the App (The Map)
Open a **new** terminal window (keep the server running!). Make sure you are in the main project folder (`client`) and type:
```bash
npm install
npm start
```
✅ Your browser will automatically open `http://localhost:3000`. Click **"Allow"** when it asks for your location, and BOOM! The map is ready to use! 🌍
