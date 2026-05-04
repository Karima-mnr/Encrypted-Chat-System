const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

console.log('==========================================');
console.log('🚀 STARTING BACKEND SERVER');
console.log('==========================================');

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  dbName: 'cryptchat'
})
.then(() => {
  console.log('✅ MongoDB connected to database: cryptchat');
})
.catch(err => {
  console.error('❌ MongoDB error:', err.message);
});

// Define Schemas
const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  encryptedMessage: { type: String, required: true },
  keySize: { type: Number, default: 512 },
  messageNumber: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false }
});

const metricSchema = new mongoose.Schema({
  metricId: { type: String, required: true, unique: true },
  messageId: { type: String, required: true },
  keySize: { type: Number, required: true },
  encryptionTime: { type: Number, default: 0 },
  decryptionTime: { type: Number, default: 0 },
  transmissionTime: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  email: String,
  passwordHash: String,
  role: String,
  publicKey: String,
  lastKeySize: { type: Number, default: 512 },
  loginCount: { type: Number, default: 0 },
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
});

const Message = mongoose.model('Message', messageSchema);
const Metric = mongoose.model('Metric', metricSchema);
const User = mongoose.model('User', userSchema);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`📡 User ${userId} joined room: ${userId}`);
  });
  
  socket.on('send_message', async (data) => {
    console.log('==========================================');
    console.log('📨 MESSAGE RECEIVED');
    console.log('   From:', data.from);
    console.log('   To:', data.to);
    console.log('   Key Size:', data.keySize);
    console.log('   Message Number:', data.messageNumber);
    console.log('==========================================');
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Save message to database
      const message = new Message({
        messageId,
        fromUserId: data.from,
        toUserId: data.to,
        encryptedMessage: data.encryptedMessage,
        keySize: data.keySize,
        messageNumber: data.messageNumber,
        timestamp: new Date(),
        delivered: true
      });
      await message.save();
      console.log('💾 Message saved to database');
      
      // Save metric
      const metric = new Metric({
        metricId: `met_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messageId,
        keySize: data.keySize,
        encryptionTime: data.encryptionTime || 0,
        transmissionTime: 0
      });
      await metric.save();
      console.log('📊 Metric saved to database');
      
      // Forward to recipient
      console.log(`📤 Forwarding to room: ${data.to}`);
      io.to(data.to).emit('receive_message', {
        from: data.from,
        to: data.to,
        encryptedMessage: data.encryptedMessage,
        keySize: data.keySize,
        messageNumber: data.messageNumber,
        messageId,
        timestamp: new Date()
      });
      
      console.log('✅ Message forwarded successfully');
    } catch (err) {
      console.error('❌ Error saving message:', err.message);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { fromUserId: req.params.userId },
        { toUserId: req.params.userId }
      ]
    }).sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await Metric.find().sort({ timestamp: -1 }).limit(100);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find({}, 'userId username role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/get-public-key', async (req, res) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({ username });
    res.json({ 
      username: user?.username,
      publicKey: user?.publicKey || null,
      hasKeys: !!user?.publicKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/generate-keys', async (req, res) => {
  try {
    const { userId, username, publicKey, keySize } = req.body;
    const result = await User.updateOne(
      { username: username },
      { 
        $set: { 
          publicKey: publicKey,
          lastKeySize: keySize
        },
        $inc: { loginCount: 1 }
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize users
async function initUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('📝 Creating default users...');
    await User.insertMany([
      { userId: "USER_001", username: "Karima", email: "karima@cryptchat.com", passwordHash: "kali", role: "user", publicKey: null, lastKeySize: 512, loginCount: 0, createdAt: new Date(), isActive: true },
      { userId: "USER_002", username: "Nour", email: "nour@cryptchat.com", passwordHash: "kali", role: "user", publicKey: null, lastKeySize: 512, loginCount: 0, createdAt: new Date(), isActive: true },
      { userId: "ADMIN_001", username: "admin", email: "admin@cryptchat.com", passwordHash: "admin", role: "admin", publicKey: null, lastKeySize: 512, loginCount: 0, createdAt: new Date(), isActive: true }
    ]);
    console.log('✅ Created users: Karima, Nour, admin');
  }
}

mongoose.connection.once('open', () => {
  initUsers();
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});