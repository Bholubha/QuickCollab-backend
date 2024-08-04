const express = require("express");
const app = express();
const PORT = 5000;

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const ROOM = {}; 


socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);


  socket.on("register", ({ roomCode, userId }) => {
    if (!ROOM[roomCode]) {
      ROOM[roomCode] = []; 
    }
    ROOM[roomCode].push(userId);
    console.log(ROOM[roomCode]);
    console.log(`User ${userId} registered with ROOM ID ${roomCode}`);
  });

  socket.on("sendCollab", (ele) => {
    
    if (ele && ele.CODE && Array.isArray(ROOM[ele.CODE])) {
      
      // console.log(ROOM[ele.CODE])

      for (const member of ROOM[ele.CODE]) {
      
        if (typeof member === 'string' && ele.id !== member) {  //not send to sender itself
          socketIO.to(member).emit("getCollab", ele);
        }
      }
    } else {
      console.error('Invalid ele or ROOM[ele.CODE]');
    }
  });


  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
// remove member when they leave room
    for (let roomCode in ROOM) {
      const index = ROOM[roomCode].indexOf(socket.id);
      if (index !== -1) {
        ROOM[roomCode].splice(index, 1);
        console.log(`User ${socket.id} removed from room ${roomCode}`);
      }
    }
  });
});
