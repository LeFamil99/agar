const express = require("express");
const app = express();
const path = require("path");
const http = require("http").createServer(app);
const debug = require("debug")("app");
const io = require("socket.io")(http)
const compression = require("compression");
const helmet = require("helmet");

app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

/*app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html") 
});;*/

let hasName = false;
let users = 0;
let usersNamed = 0;
let food = []; 


io.on("connection", (socket) => { 
  hasName = false;
  users++;
  debug("a user connected"); 
  

  socket.on("disconnect", () => {
    if(hasName)
    usersNamed--;
    users--;
    debug("user disconnected");
    socket.broadcast.emit("disconnected", socket.id)
  });

  socket.on("position", pos => {
    socket.emit("food", food); 
    socket.broadcast.emit("position", {
      pos: pos, 
      user: socket.username, 
      id: socket.id, 
      color: socket.color
    });
    //debug(pos);
  });

  socket.on("set name", x => {
    hasName = true;
    usersNamed++;
    socket.username = x.user;
    socket.color = x.color
    debug(socket.username)
    socket.broadcast.emit("connected", {pos: {
      x: 0,
      y: 0, 
      r: 0
    }, user: socket.username, id: socket.id})
  });

  socket.on("eaten", i => {
    food.splice(i, 1);
  });

  socket.on("kill", id => {
    socket.emit("disconnected", id);
    socket.broadcast.to(id).emit("kill", socket.id);
    usersNamed--;
  });

  socket.on("noname", () => {
    hasName = false
  });
});

function generateFood() {
  if(usersNamed > 0) {
    food.push({
      color: Math.floor(Math.random() * 12),
      x: Math.floor(Math.random() * 1940 + 30),
      y: Math.floor(Math.random() * 940 + 30),
    })
    if(food.length > 800) {
      food.shift();
    }
  } else {
    food = [];
  }
  
  //debug(usersNamed);
  // debug(users);
  setTimeout(generateFood, 30);
}
generateFood();



const port = process.env.PORT || 3000;

http.listen(port, ()=> {
    debug("Listening on " + port);
});