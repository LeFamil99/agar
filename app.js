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

const hasName = false;
let users = 0;


io.on("connection", (socket) => {
  debug("a user connected");
  users++;

  socket.on("disconnect", () => {
    users--;
    debug("user disconnected");
    socket.broadcast.emit("disconnected", socket.id)
  });

  socket.on("position", pos => {
    socket.broadcast.emit("position", {pos: pos, user: socket.username, id: socket.id, color: socket.color});
    //debug(pos);
  });

  socket.on("set name", x => {
    socket.username = x.user;
    socket.color = x.color
    debug(socket.username)
    socket.broadcast.emit("connected", {pos: {
      x: 0,
      y: 0,
      r: 0
    }, user: socket.username, id: socket.id})
  })
});

const port = process.env.PORT || 3000;

http.listen(port, ()=> {
    debug("Listening on " + port);
});