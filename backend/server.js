const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config({ path: '../.env.local' });

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Simple schemas for backend
const messageSchema = new mongoose.Schema({
  messageId: String,
  fromUserId: String,
  toUserId: String,
  encryptedMessage: String,
  messageNumber: Number,
  timestamp: { type: Date, default: Date.now }
});

const metricSchema = new mongoose.Schema({
  metricId: String,
  messageId: String,
  keySize: Number,
  encryptionTime: Number,
  decryptionTime: { type: Number, default: 0 },
  transmissionTime: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);
const Metric = mongoose.model('Metric', metricSchema);

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('send_message', async (data) => {
    const { from, to, encryptedMessage, keySize, encryptionTime, messageNumber } = data;
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});