import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';

// Fix for default marker icon issues in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icon for Queries to distinguish from Users
const QueryIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

/**
 * Component to handle map clicks for posting queries
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function App() {
  // State to hold coordinates of all users in the huddle
  const [users, setUsers] = useState({});
  // State for the current user's name
  const [username, setUsername] = useState("");
  // State to hold live queries posted on the map
  const [queries, setQueries] = useState([]);
  
  // Nagpur coordinates for center point
  const center = [21.1458, 79.0882];

  // Initialize socket connection once
  const socket = useMemo(() => io("http://localhost:5000", {
    transports: ["websocket"] 
  }), []);

  // Set username on initial load
  useEffect(() => {
    if (!username) {
      const name = prompt("Please enter your name to join the Huddle:") || `User_${Math.floor(Math.random() * 1000)}`;
      setUsername(name);
    }
  }, []);

  // NEW: Fetch existing queries from Database on load 
  // This ensures the "Huddle" is global and public even for new joiners
  useEffect(() => {
    fetch("http://localhost:5000/api/queries")
      .then(res => res.ok ? res.json() : [])
      .then(data => setQueries(data))
      .catch(err => console.log("Note: Database history not yet available."));
  }, []);

  // Function to post a new query to the Huddle
  const postQuery = useCallback((latlng) => {
    const text = prompt("What is your query for this location?");
    if (text) {
      const queryData = { lat: latlng.lat, lng: latlng.lng, text, user: username, timestamp: Date.now() };
      socket.emit("send-query", queryData);
    }
  }, [socket, username]);

  useEffect(() => {
    // 1. Capture user's live geolocation
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // 2. Emit location updates to the server
          socket.emit("send-location", { latitude, longitude, username });
        },
        (error) => {
          console.error("Geolocation Error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [socket, username]);

  useEffect(() => {
    // Listen for new live queries
    socket.on("receive-query", (query) => {
      setQueries((prev) => [...prev, query]);
    });

    // 3. Listen for other users' locations
    socket.on("receive-location", (data) => {
      const { id, latitude, longitude, username: otherUser } = data;
      setUsers((prevUsers) => ({
        ...prevUsers,
        [id]: { latitude, longitude, username: otherUser },
      }));
    });

    // Cleanup when a user leaves
    socket.on("user-disconnected", (id) => {
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        delete newUsers[id];
        return newUsers;
      });
    });

    return () => {
      socket.off("receive-location");
      socket.off("user-disconnected"); 
      socket.off("receive-query");
    };
  }, [socket]);

  return (
    <div className="map-wrapper" style={{ height: "100vh", width: "100vw" }}>
      <div style={{ 
        position: 'absolute', top: 10, left: 50, zIndex: 1000, 
        background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' 
      }}>
        <strong>Huddle Live: {username}</strong>
        <p style={{ margin: 0, fontSize: '12px' }}>Click anywhere on the map to post a query.</p>
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={postQuery} />

        {/* 4. Render Leaflet Markers for every active user */}
        {Object.entries(users).map(([id, userData]) => (
          <Marker key={id} position={[users[id].latitude, users[id].longitude]}>
            <Popup>
              <strong>{users[id].username || "Anonymous"}</strong><br />
              Status: Active in Huddle
            </Popup>
          </Marker>
        ))}

        {/* Render Live Queries */}
        {queries.map((q, index) => (
          <Marker key={q._id || `query-${index}-${q.timestamp}`} position={[q.lat, q.lng]} icon={QueryIcon}>
            {/* Permanent Tooltip highlights the text so it is seen 'from far' */}
            <Tooltip permanent direction="top" offset={[0, -20]} className="query-tooltip">
              {q.text}
            </Tooltip>
            <Popup>
              <strong>{q.user}:</strong><br />
              {q.text}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;