const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const bcrypt = require('bcryptjs');

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


mongoose.connect(MONGODB_URI, { dbName: 'cryptchat' })
  .then(() => console.log(' MongoDB connected to cryptchat'))
  .catch(err => console.error(' MongoDB error:', err.message));

// ==================== SCHEMAS ====================
const userSchema = new mongoose.Schema({
  userId: String,
  username: { type: String, unique: true },
  email: String,
  passwordHash: String,
  role: { type: String, default: 'user' },
  publicKey: String,
  lastKeySize: { type: Number, default: 512 },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const messageSchema = new mongoose.Schema({
  messageId: String,
  fromUsername: String,
  toUsername: String,
  encryptedMessage: String,
  keySize: Number,
  messageNumber: Number,
  encryptionTime: Number,
  timestamp: { type: Date, default: Date.now }
});

const metricSchema = new mongoose.Schema({
  metricId: String,
  messageId: String,
  keySize: Number,
  encryptionTime: Number,
  decryptionTime: { type: Number, default: 0 },
  transmissionTime: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Metric = mongoose.model('Metric', metricSchema);

// ==================== API ROUTES ====================

// Get all users
app.get('/api/auth/users', async (req, res) => {
  const users = await User.find({}, 'userId username role publicKey');
  res.json(users);
});

// Get user's public key
app.get('/api/auth/get-public-key', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ username });
  res.json({ publicKey: user?.publicKey || null });
});

// Save public key
app.post('/api/auth/generate-keys', async (req, res) => {
  const { username, publicKey, keySize } = req.body;
  await User.updateOne(
    { username },
    { $set: { publicKey, lastKeySize: keySize }, $inc: { loginCount: 1 } }
  );
  console.log(` Keys saved for ${username} (${keySize}-bit RSA)`);
  res.json({ success: true });
});

// Get messages between users
app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [
      { fromUsername: user1, toUsername: user2 },
      { fromUsername: user2, toUsername: user1 }
    ]
  }).sort({ timestamp: 1 });
  res.json(messages);
});

// Get metrics for dashboard
app.get('/api/metrics', async (req, res) => {
  const metrics = await Metric.find().sort({ timestamp: -1 }).limit(50);
  res.json(metrics);
});

app.post('/api/metrics/update', async (req, res) => {
  const { messageId, decryptionTime } = req.body;
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔓 DECRYPTION METRIC RECEIVED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Message ID: ${messageId}`);
  console.log(`   Decryption Time: ${decryptionTime?.toFixed(2) || 0}ms`);
  
  try {
    const metric = await Metric.findOne({ messageId: messageId });
    
    if (metric) {
      metric.decryptionTime = decryptionTime;
      metric.totalTime = (metric.encryptionTime || 0) + (metric.transmissionTime || 0) + decryptionTime;
      await metric.save();
      
      console.log(`\n✅ [METRIC UPDATED] Complete timing:`);
      console.log(`   🔐 Encryption: ${metric.encryptionTime?.toFixed(2) || 0}ms`);
      console.log(`   🌐 Transmission: ${metric.transmissionTime || 0}ms`);
      console.log(`   🔓 Decryption: ${decryptionTime?.toFixed(2) || 0}ms`);
      console.log(`   ⏱️ Total: ${metric.totalTime?.toFixed(2) || 0}ms`);
      console.log('═══════════════════════════════════════════════════════════\n');
      
      res.json({ success: true, metric });
    } else {
      console.log('❌ Metric not found!');
      res.json({ success: false, error: 'Metric not found' });
    }
  } catch (err) {
    console.error('Error updating metric:', err);
    res.status(500).json({ error: err.message });
  }
});
// Get message statistics
app.get('/api/messages/stats', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 }).limit(100);
  res.json(messages);
});
// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('join', (username) => {
    socket.join(username);
    console.log(` ${username} joined secure channel`);
  });
  
  socket.on('send_message', async (data) => {
  const startTime = Date.now();
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' MESSAGE FLOW - ENCRYPTED MESSAGE RECEIVED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   From: ${data.from}`);
  console.log(`   To: ${data.to}`);
  console.log(`   Key Size: ${data.keySize}-bit RSA`);
  console.log(`   Encryption Time: ${data.encryptionTime?.toFixed(2) || 0}ms`);
  console.log(`   Encrypted Message: ${data.encryptedMessage.substring(0, 50)}...`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Save message
  const message = new Message({
    messageId,
    fromUsername: data.from,
    toUsername: data.to,
    encryptedMessage: data.encryptedMessage,
    keySize: data.keySize,
    messageNumber: data.messageNumber,
    encryptionTime: data.encryptionTime || 0
  });
  await message.save();
  console.log(` [DATABASE] Message saved to MongoDB (ID: ${messageId})`);
  
  // Calculate transmission time
  const transmissionTime = Date.now() - startTime;
  
  // Save metric
  const metric = new Metric({
    metricId: `met_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    messageId,
    keySize: data.keySize,
    encryptionTime: data.encryptionTime || 0,
    transmissionTime: transmissionTime,
    timestamp: new Date()
  });
  await metric.save();
  console.log(` [METRIC] Saved - Enc: ${(data.encryptionTime || 0).toFixed(2)}ms, Trans: ${transmissionTime}ms`);
  
  // Forward to recipient
  io.to(data.to).emit('receive_message', {
    messageId,
    from: data.from,
    encryptedMessage: data.encryptedMessage,
    keySize: data.keySize,
    messageNumber: data.messageNumber,
    encryptionTime: data.encryptionTime || 0,
    timestamp: new Date()
  });
  
  console.log(`\n [FORWARD] Encrypted message forwarded to ${data.to}`);
  console.log(`   Ciphertext: ${data.encryptedMessage.substring(0, 50)}...`);
  console.log('═══════════════════════════════════════════════════════════\n');
});
  
  socket.on('disconnect', () => {
    console.log(' Client disconnected:', socket.id);
  });
});

// ==================== INIT DATABASE ====================
async function initDatabase() {
  const count = await User.countDocuments();
  
  if (count === 0) {
    console.log(' Creating users with HASHED passwords...');
    
    const hashedPassword = "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYJYqE5KqXvJ9qVqXvJ9qVqXvJ9q";
    
    await User.insertMany([
      { 
        userId: "USER_001", 
        username: "Karima", 
        email: "karima@cryptchat.com", 
        passwordHash: hashedPassword,
        role: "user", 
        publicKey: null 
      },
      { 
        userId: "USER_002", 
        username: "Nour", 
        email: "nour@cryptchat.com", 
        passwordHash: hashedPassword,
        role: "user", 
        publicKey: null 
      },
      { 
        userId: "ADMIN_001", 
        username: "admin", 
        email: "admin@cryptchat.com", 
        passwordHash: hashedPassword,
        role: "admin", 
        publicKey: null 
      }
    ]);
    
    console.log(' Created Karima, Nour, admin with HASHED passwords');
  } else {
    console.log(` Database already has ${count} users`);
  }
}

mongoose.connection.once('open', async () => {
  await initDatabase();
  
  const users = await User.find({}, 'username passwordHash');
  console.log(' Current users:');
  users.forEach(u => {
    const isHashed = u.passwordHash?.startsWith('$2a$');
    console.log(`   - ${u.username}: ${isHashed ? '✅ hashed' : '❌ plain text'}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(` Server: http://localhost:${PORT}`);
});