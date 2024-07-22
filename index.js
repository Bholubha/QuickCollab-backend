const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const redisAdapter = require('socket.io-redis');

const app = express();
const server = http.Server(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Allows all origins, for development only
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: '*', // Allows all origins, for development only
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

io.adapter(redisAdapter({
  host: 'https://quickcollab-backend-production.up.railway.app', // Redis server host
  port: 6379 // Redis server port
}));

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("sendCollab", (ele) => {
    if (ele !== undefined && ele !== null) io.emit("getCollab", ele);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

const PORT =  5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
