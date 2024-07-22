const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const compression = require('compression');
const redisAdapter = require('socket.io-redis');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const app = express();
const server = http.Server(app);
const io = socketIO(server, {
  cors: {
    origin: "*"
  }
});

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  app.use(compression());

  app.get('/api', (req, res) => {
    res.json({
      message: 'Hello world',
    });
  });

  // Configure the Redis adapter for Socket.IO
  io.adapter(redisAdapter({
    host: 'https://quickcollab-backend-production.up.railway.app', // Redis server running on the same machine
    port: 6379        // Default Redis port
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

  server.listen(5000, () => {
    console.log(`Server listening on port 5000`);
  });
}
