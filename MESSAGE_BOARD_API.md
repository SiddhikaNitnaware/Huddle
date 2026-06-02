# 📋 Global Message Board API Documentation

## Overview
The Huddle message board is a **public, chronologically-numbered comment thread** where:
- ✅ Every message gets a unique, sequential number
- ✅ Users can reply to any message by number (e.g., ">>5")
- ✅ All messages are visible to everyone (global transparency)
- ✅ Real-time updates via Socket.IO
- ✅ Vote system (upvote/downvote)
- ✅ Thread/topic organization
- ✅ Optional location tagging

---

## 🔢 Message Numbering System

### Auto-Increment Sequence
- Messages are numbered starting from **1**
- Each new message gets **next sequential number**
- Numbers are **permanent** and **never reused**
- Deleted messages keep their number (soft delete)

### Example Thread:
```
#1: "Welcome to Huddle!"
#2: ">>1 Thanks! How does this work?"
#3: ">>2 You just post and reference message numbers!"
#4: "Anyone know about the map feature?"
#5: ">>4 Yes! Check the docs"
```

---

## 📡 REST API Endpoints

### 1. Get Messages (with Pagination)

**GET** `/api/messages`

**Query Parameters:**
- `limit` (number, default: 50) - Max messages to return
- `after` (number, default: 0) - Get messages after this number
- `topic` (string, optional) - Filter by topic
- `replyTo` (number, optional) - Get only replies to this message

**Example Requests:**
```bash
# Get latest 50 messages
GET /api/messages

# Get messages after #100
GET /api/messages?after=100&limit=50

# Get all replies to message #5
GET /api/messages?replyTo=5

# Get messages from "tech" topic
GET /api/messages?topic=tech
```

**Response:**
```json
{
  "messages": [
    {
      "_id": "673abc...",
      "messageNumber": 42,
      "text": "Hello world!",
      "username": "john_doe",
      "userId": "673xyz...",
      "replyTo": null,
      "topic": "general",
      "location": {
        "type": "Point",
        "coordinates": [79.0882, 21.1458]
      },
      "upvotes": 5,
      "downvotes": 0,
      "edited": false,
      "createdAt": "2024-06-02T10:30:00Z"
    }
  ],
  "latestNumber": 150,
  "hasMore": true
}
```

---

### 2. Get Single Message

**GET** `/api/messages/:messageNumber`

**Example:**
```bash
GET /api/messages/42
```

**Response:**
```json
{
  "message": {
    "messageNumber": 42,
    "text": "Hello world!",
    "username": "john_doe",
    // ... other fields
  },
  "replies": [
    {
      "messageNumber": 43,
      "text": ">>42 Hi there!",
      "replyTo": 42,
      // ...
    }
  ],
  "replyCount": 3
}
```

---

### 3. Post New Message

**POST** `/api/messages`

**Headers:**
```
Authorization: Bearer <token>  // Optional - can post anonymously
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": ">>5 Great point! I agree",
  "replyTo": 5,  // Optional - message number being replied to
  "topic": "general",  // Optional - default: "general"
  "location": {  // Optional
    "lat": 21.1458,
    "lng": 79.0882
  }
}
```

**Response:**
```json
{
  "message": "Message posted successfully",
  "data": {
    "messageNumber": 151,
    "text": ">>5 Great point! I agree",
    "username": "john_doe",
    "replyTo": 5,
    "createdAt": "2024-06-02T10:35:00Z"
  }
}
```

---

### 4. Vote on Message

**POST** `/api/messages/:messageNumber/vote`

**Request Body:**
```json
{
  "vote": "up"  // or "down"
}
```

**Response:**
```json
{
  "message": "Vote recorded",
  "upvotes": 6,
  "downvotes": 0
}
```

---

### 5. Edit Message (Auth Required)

**PUT** `/api/messages/:messageNumber`

**Headers:**
```
Authorization: Bearer <token>  // Required
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Updated message text"
}
```

**Response:**
```json
{
  "message": "Message updated",
  "data": {
    "messageNumber": 42,
    "text": "Updated message text",
    "edited": true,
    "editedAt": "2024-06-02T10:40:00Z"
  }
}
```

**Rules:**
- Can only edit your own messages
- Original timestamp preserved
- `edited` flag set to true

---

### 6. Delete Message (Auth Required)

**DELETE** `/api/messages/:messageNumber`

**Headers:**
```
Authorization: Bearer <token>  // Required
```

**Response:**
```json
{
  "message": "Message deleted"
}
```

**Rules:**
- Soft delete (message number preserved)
- Text replaced with "[deleted]"
- Can only delete your own messages
- Replies still reference the number

---

### 7. Get Thread View

**GET** `/api/messages/:messageNumber/thread`

Gets a message and ALL its nested replies recursively.

**Example:**
```bash
GET /api/messages/5/thread
```

**Response:**
```json
{
  "messageNumber": 5,
  "text": "Original message",
  "replies": [
    {
      "messageNumber": 7,
      "text": ">>5 First reply",
      "replyTo": 5,
      "replies": [
        {
          "messageNumber": 9,
          "text": ">>7 Nested reply",
          "replyTo": 7,
          "replies": []
        }
      ]
    },
    {
      "messageNumber": 12,
      "text": ">>5 Another reply",
      "replyTo": 5,
      "replies": []
    }
  ]
}
```

---

## 🔌 Socket.IO Events (Real-Time)

### Client → Server Events

#### 1. Post Message
```javascript
socket.emit('post-message', {
  text: ">>5 Great point!",
  replyTo: 5,  // Optional
  topic: "general",  // Optional
  location: { lat: 21.1458, lng: 79.0882 },  // Optional
  username: "john_doe",
  userId: "673abc..."  // Optional
});
```

**Server Response:**
```javascript
// Success
socket.on('message-posted', (data) => {
  console.log('Posted as message #' + data.messageNumber);
});

// Error
socket.on('message-error', (error) => {
  console.error(error.message);
});
```

#### 2. Vote on Message
```javascript
socket.emit('vote-message', {
  messageNumber: 42,
  vote: 'up'  // or 'down'
});
```

**Server Response:**
```javascript
// Success - broadcasted to all
socket.on('vote-updated', (data) => {
  console.log(`Message #${data.messageNumber}: ${data.upvotes} up, ${data.downvotes} down`);
});

// Error
socket.on('vote-error', (error) => {
  console.error(error.message);
});
```

---

### Server → Client Events (Broadcasts)

#### 1. New Message Posted
```javascript
socket.on('new-message', (data) => {
  // Received when ANYONE posts a message
  console.log(`New message #${data.messageNumber}: ${data.text}`);
  
  // Add to your local message list
  addMessageToUI(data);
});
```

**Data Structure:**
```json
{
  "messageNumber": 151,
  "text": ">>5 Great idea!",
  "username": "john_doe",
  "userId": "673abc...",
  "replyTo": 5,
  "topic": "general",
  "location": { "type": "Point", "coordinates": [79.0882, 21.1458] },
  "upvotes": 0,
  "downvotes": 0,
  "createdAt": "2024-06-02T10:35:00Z"
}
```

#### 2. Vote Updated
```javascript
socket.on('vote-updated', (data) => {
  // Update vote counts in UI
  updateVoteDisplay(data.messageNumber, data.upvotes, data.downvotes);
});
```

---

## 💡 Usage Patterns

### Pattern 1: Simple Message Board

```javascript
// 1. Load recent messages on page load
fetch('/api/messages?limit=50')
  .then(res => res.json())
  .then(data => {
    displayMessages(data.messages);
    latestMessageNumber = data.latestNumber;
  });

// 2. Listen for real-time updates
socket.on('new-message', (message) => {
  appendMessage(message);
  latestMessageNumber = message.messageNumber;
});

// 3. Post a message
function postMessage(text) {
  socket.emit('post-message', {
    text: text,
    username: currentUser.username,
    userId: currentUser.id
  });
}
```

---

### Pattern 2: Reply-by-Number System

```javascript
// Parse message text for >>N references
function parseReplies(text) {
  const replyRegex = />>(\d+)/g;
  const matches = [...text.matchAll(replyRegex)];
  return matches.map(m => parseInt(m[1]));
}

// Detect reply in message
function postReply(text) {
  const referencedMessages = parseReplies(text);
  const replyTo = referencedMessages[0] || null;  // First >>N becomes replyTo
  
  socket.emit('post-message', {
    text: text,
    replyTo: replyTo,
    username: currentUser.username
  });
}

// Example usage:
postReply(">>42 I agree!"); 
// Sets replyTo: 42
```

---

### Pattern 3: Thread View

```javascript
// Show a specific thread with all replies
async function showThread(messageNumber) {
  const response = await fetch(`/api/messages/${messageNumber}/thread`);
  const thread = await response.json();
  
  displayThreadRecursive(thread);
}

function displayThreadRecursive(message, indent = 0) {
  console.log(' '.repeat(indent) + `#${message.messageNumber}: ${message.text}`);
  
  message.replies.forEach(reply => {
    displayThreadRecursive(reply, indent + 2);
  });
}
```

---

### Pattern 4: Infinite Scroll / Pagination

```javascript
let lastLoadedNumber = 0;

async function loadMoreMessages() {
  const response = await fetch(`/api/messages?after=${lastLoadedNumber}&limit=50`);
  const data = await response.json();
  
  data.messages.forEach(msg => {
    appendMessage(msg);
    lastLoadedNumber = Math.max(lastLoadedNumber, msg.messageNumber);
  });
  
  return data.hasMore;
}

// Usage with scroll detection
window.addEventListener('scroll', () => {
  if (nearBottom() && !loading) {
    loading = true;
    loadMoreMessages().then(() => loading = false);
  }
});
```

---

### Pattern 5: Live Vote Counter

```javascript
// Real-time vote updates
const voteCounters = new Map();  // messageNumber -> {upvotes, downvotes}

socket.on('vote-updated', (data) => {
  voteCounters.set(data.messageNumber, {
    upvotes: data.upvotes,
    downvotes: data.downvotes
  });
  
  // Update UI
  updateVoteDisplay(data.messageNumber, data.upvotes, data.downvotes);
});

function voteMessage(messageNumber, voteType) {
  socket.emit('vote-message', {
    messageNumber: messageNumber,
    vote: voteType
  });
}
```

---

## 🎨 Frontend UI Examples

### Example 1: 4chan-style Board

```html
<div class="message-board">
  <div class="message" data-number="42">
    <div class="message-header">
      <span class="message-number">#42</span>
      <span class="username">john_doe</span>
      <span class="timestamp">2024-06-02 10:30</span>
      <span class="votes">↑5 ↓0</span>
    </div>
    <div class="message-body">
      Hello world!
    </div>
    <div class="message-actions">
      <button onclick="replyTo(42)">Reply</button>
      <button onclick="vote(42, 'up')">↑</button>
      <button onclick="vote(42, 'down')">↓</button>
    </div>
  </div>
</div>
```

### Example 2: Reddit-style Threads

```html
<div class="thread">
  <div class="message root" data-number="5">
    <div class="vote-buttons">
      <button onclick="vote(5, 'up')">▲</button>
      <span class="score">5</span>
      <button onclick="vote(5, 'down')">▼</button>
    </div>
    <div class="content">
      <div class="meta">
        <span class="number">#5</span>
        <span class="author">john_doe</span>
        <span class="time">2h ago</span>
      </div>
      <div class="text">Original post</div>
    </div>
  </div>
  
  <div class="replies" style="margin-left: 20px;">
    <!-- Nested replies here -->
  </div>
</div>
```

---

## 🔒 Security Considerations

### Anonymous Posting
- ✅ Allowed by default
- ⚠️ Consider rate limiting per IP
- ⚠️ Add CAPTCHA for spam prevention

### Authenticated Posting
- ✅ User ownership tracked
- ✅ Can edit/delete own messages
- ✅ Username displayed automatically

### Recommendations:
1. **Rate Limiting:** Max 10 messages per minute per user/IP
2. **Content Moderation:** Implement report system
3. **Spam Prevention:** CAPTCHA or proof-of-work
4. **Message Length:** Limit to 2000 characters
5. **Image Uploads:** Separate image service with moderation

---

## 📊 Database Indexes

Efficient queries require proper indexing:

```javascript
// Already implemented in Message.js
MessageSchema.index({ messageNumber: 1 });  // Primary key
MessageSchema.index({ replyTo: 1 });        // Find replies
MessageSchema.index({ createdAt: -1 });     // Sort by time
MessageSchema.index({ topic: 1 });          // Filter by topic
MessageSchema.index({ location: "2dsphere" });  // Geospatial queries
```

---

## 🚀 Performance Tips

### For Large Boards (1000+ messages)

1. **Pagination:** Always use `limit` parameter
2. **Incremental Loading:** Use `after` parameter
3. **Virtual Scrolling:** Render only visible messages
4. **Caching:** Cache message counts and latest numbers
5. **Indexes:** Ensure all indexes are created

### WebSocket Optimization

```javascript
// Batch multiple votes into single update
let voteBatch = [];
setInterval(() => {
  if (voteBatch.length > 0) {
    socket.emit('vote-batch', voteBatch);
    voteBatch = [];
  }
}, 1000);
```

---

## 🎯 Example: Complete Implementation

See the example React component in `src/MessageBoard.js` (to be created) for a full implementation with:
- Message list with infinite scroll
- Reply-by-number functionality
- Real-time updates
- Vote buttons
- Thread view

---

**Ready to build a transparent, numbered message board with Huddle!** 🚀
