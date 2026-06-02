import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { AuthProvider, useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import HeatmapLayer from './HeatmapLayer';
import CommentCard from './CommentCard';
import './App.css';

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

function HuddleMap() {
  const { user, isAuthenticated, logout } = useAuth();
  
  // State to hold coordinates of all users in the huddle
  const [users, setUsers] = useState({});
  // State for the current user's name
  const [username, setUsername] = useState("");
  // State to hold live queries posted on the map
  const [queries, setQueries] = useState([]);
  // State for user's current location
  const [userLocation, setUserLocation] = useState(null);
  // State for showing login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  // State for nearby queries filter (in km)
  const [radiusFilter, setRadiusFilter] = useState(null); // null = show all
  // State for heatmap toggle
  const [showHeatmap, setShowHeatmap] = useState(false);
  // State for selected query (for replies)
  const [selectedQuery, setSelectedQuery] = useState(null);
  // State for reply input
  const [replyText, setReplyText] = useState('');
  // State for expanded comment (show replies)
  const [expandedComment, setExpandedComment] = useState(null);
  
  // Nagpur coordinates for center point
  const center = [21.1458, 79.0882];

  // Initialize socket connection once
  const socket = useMemo(() => io("http://localhost:5000", {
    transports: ["websocket"] 
  }), []);

  // Set username on initial load
  useEffect(() => {
    if (!username) {
      const name = isAuthenticated && user ? user.username : 
        (prompt("Please enter your name to join the Huddle:") || `User_${Math.floor(Math.random() * 1000)}`);
      setUsername(name);
    }
  }, [isAuthenticated, user, username]);

  // Fetch messages from the message board API
  const fetchQueries = useCallback(() => {
    const url = "http://localhost:5000/api/messages?limit=100";

    fetch(url)
      .then(res => res.ok ? res.json() : { messages: [] })
      .then(data => {
        if (!data.messages || data.messages.length === 0) {
          setQueries([]);
          return;
        }

        // Transform message board data to match query format for display
        const transformedMessages = data.messages.map(msg => ({
          _id: msg.messageNumber.toString(),
          lat: 21.1458 + (Math.random() - 0.5) * 0.05, // Distribute on map
          lng: 79.0882 + (Math.random() - 0.5) * 0.05,
          text: msg.text || "",
          user: msg.username || "Anonymous",
          userId: msg.userId,
          timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          messageNumber: msg.messageNumber,
          replyTo: msg.replyTo,
          upvotes: msg.upvotes || 0,
          downvotes: msg.downvotes || 0,
          replies: [] // Will be populated from other messages
        }));

        // Build reply chains
        const messageMap = new Map();
        transformedMessages.forEach(msg => messageMap.set(msg.messageNumber, msg));

        transformedMessages.forEach(msg => {
          if (msg.replyTo && messageMap.has(msg.replyTo)) {
            const parent = messageMap.get(msg.replyTo);
            if (!parent.replies) parent.replies = [];
            parent.replies.push(msg);
          }
        });

        // Only show root messages (those that don't reply to anything)
        const rootMessages = transformedMessages.filter(msg => !msg.replyTo);
        setQueries(rootMessages);
      })
      .catch(err => console.log("Error fetching messages:", err));
  }, []);

  // Fetch existing queries from Database on load 
  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  // Function to post a new message to the message board
  const postQuery = useCallback((latlng) => {
    const text = prompt("What's your message?");
    if (text && text.trim()) {
      const messageData = { 
        text: text.trim(),
        username: username,
        topic: "general",
        replyTo: null
      };

      // Post to message board API
      fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData)
      })
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            // Emit via socket for real-time update
            socket.emit("post-message", messageData);
            // Refresh messages
            fetchQueries();
          }
        })
        .catch(err => console.error("Error posting message:", err));
    }
  }, [socket, username, fetchQueries]);

  // Function to handle voting
  const handleVote = useCallback((messageNumber, voteType) => {
    fetch(`http://localhost:5000/api/messages/${messageNumber}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: voteType })
    })
      .then(res => res.json())
      .then(data => {
        if (data.upvotes !== undefined) {
          socket.emit("vote-message", { messageNumber, vote: voteType });
          fetchQueries();
        }
      })
      .catch(err => console.error("Error voting:", err));
  }, [socket, fetchQueries]);

  // Function to submit a reply to a message
  const submitReply = useCallback((messageNumber, text) => {
    if (!text || !text.trim()) return;

    const replyData = {
      text: text.trim(),
      username: username,
      replyTo: messageNumber,
      topic: "general"
    };

    // Post reply to message board API
    fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replyData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          socket.emit("post-message", replyData);
          fetchQueries();
        }
      })
      .catch(err => console.error("Error posting reply:", err));
  }, [username, socket, fetchQueries]);

  useEffect(() => {
    // 1. Capture user's live geolocation
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
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
    // Listen for new live messages
    socket.on("new-message", (message) => {
      fetchQueries();
    });

    // Listen for vote updates
    socket.on("vote-updated", (data) => {
      fetchQueries();
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
      socket.off("new-message");
      socket.off("vote-updated");
      socket.off("receive-location");
      socket.off("user-disconnected");
    };
  }, [socket, fetchQueries]);

  return (
    <div className="map-wrapper" style={{ height: "100vh", width: "100vw" }}>
      {/* Header Controls */}
      <div className="huddle-header">
        <div className="header-left">
          <strong>🌍 Huddle Live: {username}</strong>
          <p style={{ margin: 0, fontSize: '12px' }}>Click anywhere on the map to post a query.</p>
        </div>
        
        <div className="header-right">
          {!isAuthenticated ? (
            <button className="auth-btn" onClick={() => setShowLoginModal(true)}>
              Login / Register
            </button>
          ) : (
            <div className="user-profile">
              <span>👤 {user?.username}</span>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <label>📍 Nearby Queries:</label>
          <select 
            value={radiusFilter || ''} 
            onChange={(e) => setRadiusFilter(e.target.value ? parseFloat(e.target.value) : null)}
          >
            <option value="">All Queries</option>
            <option value="1">Within 1 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={(e) => setShowHeatmap(e.target.checked)}
            />
            🔥 Heatmap View
          </label>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="stats-panel">
        <span>👥 Active Users: {Object.keys(users).length}</span>
        <span>❓ Queries: {queries.length}</span>
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

        {/* Heatmap Layer */}
        {showHeatmap && <HeatmapLayer points={queries} intensity={0.6} radius={30} />}

        {/* Render Leaflet Markers for every active user */}
        {!showHeatmap && Object.entries(users).map(([id, userData]) => (
          <Marker key={id} position={[users[id].latitude, users[id].longitude]}>
            <Popup>
              <strong>{users[id].username || "Anonymous"}</strong><br />
              Status: Active in Huddle
            </Popup>
          </Marker>
        ))}

        {/* Render Clean Comment Cards */}
        {!showHeatmap && queries.map((q, index) => (
          <Marker key={q._id || `message-${index}-${q.messageNumber}`} position={[q.lat, q.lng]} icon={QueryIcon}>
            {/* Clean compact tooltip */}
            <Tooltip permanent direction="top" offset={[0, -20]} className="query-tooltip">
              #{q.messageNumber}
            </Tooltip>
            <Popup 
              className="comment-popup" 
              closeButton={false} 
              maxWidth={340} 
              minWidth={300}
            >
              <CommentCard 
                comment={q} 
                onReply={(text) => submitReply(q.messageNumber, text)}
                onVote={(type) => handleVote(q.messageNumber, type)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HuddleMap />
    </AuthProvider>
  );
}

export default App;