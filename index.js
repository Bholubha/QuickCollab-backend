const express = require('express');
const app = express();
const PORT = 4000;

//New imports
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const socketIO = require('socket.io')(http, {
  cors: {
      origin: "*"
  }
});



//Add this before the app.get() block
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("sendCollab",(ele)=>{
 
    if(ele != undefined && ele != null) socketIO.emit("getCollab",ele);
  })
  
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});