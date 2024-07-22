const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cluster = require('cluster');
const os = require('os');

const PORT = 5000;
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  
  // Middleware for CORS
  const cors = require('cors');
  app.use(cors());

  const server = http.Server(app);
  const io = socketIO(server, {
    cors: {
      origin: "*"
    }
  });


  // Define a simple API endpoint
  app.get('/api', (req, res) => {
    res.json({
      message: 'Hello world',
    });
  });

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('sendCollab', (ele) => {
      if (ele != undefined && ele != null) {
        io.emit('getCollab', ele);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
  });

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}
