const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

// Load environment variables
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

console.log('📡 Connecting to MongoDB...');

// Define Schemas
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  publicKey: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
});

const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  encryptedMessage: { type: String, required: true },
  encryptionMethod: { type: String, enum: ['RSA', 'AES'], default: 'RSA' },
  messageNumber: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

const metricSchema = new mongoose.Schema({
  metricId: { type: String, required: true, unique: true },
  messageId: { type: String, required: true },
  keySize: { type: Number, required: true },
  encryptionTime: { type: Number, required: true },
  decryptionTime: { type: Number, default: 0 },
  transmissionTime: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Metric = mongoose.model('Metric', metricSchema);

// Function to initialize database with users
async function initializeDatabase() {
  try {
    // Check if users exist
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📝 No users found. Creating default users...');
      
      // Insert default users
      const defaultUsers = [
        {
          userId: "USER_001",
          username: "Karima",
          email: "karima@cryptchat.com",
          passwordHash: "kali",
          role: "user",
          publicKey: null,
          createdAt: new Date(),
          lastLogin: null,
          isActive: true
        },
        {
          userId: "USER_002",
          username: "Nour",
          email: "nour@cryptchat.com",
          passwordHash: "kali",
          role: "user",
          publicKey: null,
          createdAt: new Date(),
          lastLogin: null,
          isActive: true
        },
        {
          userId: "ADMIN_001",
          username: "admin",
          email: "admin@cryptchat.com",
          passwordHash: "admin",
          role: "admin",
          publicKey: null,
          createdAt: new Date(),
          lastLogin: null,
          isActive: true
        }
      ];
      
      await User.insertMany(defaultUsers);
      console.log('✅ Created 3 default users: Karima, Nour, admin');
      
      // Create indexes
      await User.createIndexes();
      await Message.createIndexes();
      await Metric.createIndexes();
      console.log('✅ Indexes created');
    } else {
      console.log(`✅ Database already has ${userCount} users`);
    }
    
    // List all users
    const users = await User.find({}, 'username role userId');
    console.log('📋 Available users:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  console.log('📚 Database:', mongoose.connection.db.databaseName);
  
  // Initialize database with users
  await initializeDatabase();
})
.catch(err => {
  console.error('❌ MongoDB error:', err.message);
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`📡 User ${userId} joined room`);
  });
  
  socket.on('send_message', async (data) => {
    const { from, to, encryptedMessage, keySize, encryptionTime, messageNumber } = data;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const message = new Message({
        messageId,
        fromUserId: from,
        toUserId: to,
        encryptedMessage,
        messageNumber
      });
      await message.save();
      
      const metric = new Metric({
        metricId: `met_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messageId,
        keySize,
        encryptionTime
      });
      await metric.save();
      
      io.to(to).emit('receive_message', {
        from,
        encryptedMessage,
        keySize,
        messageNumber,
        messageId,
        timestamp: new Date()
      });
      
      console.log(`📨 Message ${messageNumber}: ${from} → ${to} (${keySize}-bit)`);
    } catch (err) {
      console.error('Error saving message:', err.message);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});