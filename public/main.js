const socket = io();

console.log("Vlad")
const loginPage = document.getElementsByClassName("login")[0];
const login = document.getElementById("login");
const user = document.getElementById("user");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let x = 0;
let y = 0;
let speed = 5;
let radius = 50;
let velX = 0;
let velY = 0;
let alt = [];
let arrRight = false, arrLeft = false, arrUp = false, arrDown = false;
let username;
let color;

const colors = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

/*ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(100, 100);
ctx.stroke();*/

const frame = () => {
  if(arrRight)
    x += speed;

  if(arrLeft)
    x -= speed;

  if(arrDown)
    y += speed;

  if(arrUp)
    y -= speed;
  
  
  /*x += velX;
  y += velY;*/

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let i in alt) {
    console.log(alt[i]);
    ctx.beginPath();
    ctx.arc(alt[i].pos.x, alt[i].pos.y, alt[i].pos.r, 0, Math.PI * 2);
    ctx.fillStyle = colors[alt[i].color];
    ctx.fill();
    ctx.font = `${Math.floor(alt[i].pos.r / 2.5)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(alt[i].user, alt[i].pos.x, alt[i].pos.y + Math.floor(alt[i].pos.r / 2.5) / 2.5);
  }

  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors[color];
  ctx.fill();
  ctx.font = `${Math.floor(radius / 2.5)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(username, x, y + Math.floor(radius / 2.5) / 2.5);
  ctx.stroke();
  

  socket.emit("position", {
    x: x,
    y: y,
    r: radius
  })

  window.requestAnimationFrame(frame);
}



document.addEventListener("keydown", e => {

  if(e.keyCode === 37) {
    arrLeft = true;
  }
  if(e.keyCode === 39) {
    arrRight = true;
  }

  if(e.keyCode === 38) {
    arrUp = true;
  }
  if(e.keyCode === 40) {
    arrDown = true;
  }
});

document.addEventListener("keyup", e => {

  if(e.keyCode === 37) {
    arrLeft = false;
  }
  if(e.keyCode === 39) {
    arrRight = false;
  }

  if(e.keyCode === 38) {
    arrUp = false;
  }
  if(e.keyCode === 40) {
    arrDown = false;
  }
});

login.addEventListener("submit", e => {
  e.preventDefault();
  username = user.value.trim();

  if(username) {
    if(username.toLowerCase().includes("vlad"))
      username = "Fuck you esti";
    color = Math.floor(Math.random() * 12)
    socket.emit("set name", {user: username, color: color});
    user.value = "";
    loginPage.style.display = "none";
    frame();
  }
});

socket.on("position", pos => {
  let found = false
  for(let i in alt) {
    if(alt[i].id === pos.id) {
      found = true;
      alt[i] = pos;
    }
  }
  if(!found){
    alt.push(pos);
  }
  //console.log(alt)
});

/*socket.on("connected", pos => {
  alt.push(pos);
  console.log(alt)
});*/

socket.on("disconnected", id => {
  for(let i in alt) {
    if(alt[i].id === id) {
      alt.splice(i, 1);
    }
  }
})