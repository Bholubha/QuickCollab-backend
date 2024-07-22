const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const socketIO = require('socket.io')(http, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO
  }
});
const redisAdapter = require('socket.io-redis');

// Define the port
const PORT = 5000;

// Apply the CORS middleware with default settings (allows all origins)
app.use(cors());

// Define a simple API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

// Start the HTTP server
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Apply Redis adapter (if using Redis, update host and port as needed)
socketIO.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

// Handle Socket.IO connections
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // Listen for 'sendCollab' event and broadcast it
  socket.on("sendCollab", (ele) => {
    if (ele != undefined && ele != null) {
      socketIO.emit("getCollab", ele);
    }
  });

  // Handle Socket.IO disconnections
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});
