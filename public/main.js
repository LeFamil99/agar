const socket = io();

console.log("Vlad")
const loginPage = document.getElementsByClassName("login")[0];
const login = document.getElementById("login");
const user = document.getElementById("user");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let direction = {x: 0, y: 0};
let deadzone = 1;
let decalRange = 20;
let decalX = 0;
let decalY = 0;

let x = 200;
let y = 200;
let speed = 5;
let radius = 50;
let velX = 0;
let velY = 0;
let alt = [];
let arrRight = false, arrLeft = false, arrUp = false, arrDown = false;
let username;
let color;

let spacing = 50;
let mapWidth = 2000;
let mapHeight = 1000;
borderThickness = 100000;

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
  /*if(arrRight)
    x += speed;

  if(arrLeft)
    x -= speed;

  if(arrDown)
    y += speed;

  if(arrUp)
    y -= speed;*/
  let lastX = x;
  let lastY = y;

  x += direction.x * speed;
  y += direction.y * speed;
  x = Math.min(mapWidth - radius, x)
  x = Math.max(radius, x)
  y = Math.min(mapHeight - radius, y)
  y = Math.max(radius, y)
  
  decalX += ((x - lastX) / speed * decalRange - decalX) / 20;
  decalY += ((y - lastY) / speed * decalRange - decalY) / 20;

  /*x += velX;
  y += velY;*/

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = borderThickness;
  ctx.beginPath();
  ctx.moveTo(-x + canvas.width / 2 - borderThickness / 2, -y + canvas.height / 2 - borderThickness / 2);
  ctx.lineTo(-x + canvas.width / 2 - borderThickness / 2, mapHeight - y + canvas.height / 2 + borderThickness / 2);
  ctx.lineTo(mapWidth - x + canvas.width / 2 + borderThickness / 2, mapHeight - y + canvas.height / 2 + borderThickness / 2);
  ctx.lineTo(mapWidth - x + canvas.width / 2 + borderThickness / 2, -y + canvas.height / 2 - borderThickness / 2);
  ctx.lineTo(-x + canvas.width / 2 - borderThickness / 2, -y + canvas.height / 2 - borderThickness / 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  for (let i = -x % spacing; i <= window.innerWidth; i += spacing) {
    if(i > -x + canvas.width / 2 && i < -x + canvas.width / 2 + mapWidth) {
      ctx.beginPath();
      ctx.moveTo(i, Math.max(0, -y + canvas.height / 2 + mapHeight));
      ctx.lineTo(i, Math.min(window.innerHeight, -y + canvas.height / 2));
      ctx.stroke();
    }
  }
  for (let i = -y % spacing; i <= window.innerHeight; i += spacing) {
    if(i > -y + canvas.height / 2 && i < -y + canvas.height / 2 + mapHeight) {
      ctx.beginPath();
      ctx.moveTo(Math.max(0, -x + canvas.width / 2), i);
      ctx.lineTo(Math.min(window.innerWidth, -x + canvas.width / 2 + mapWidth), i);
      ctx.stroke();
    }
  }

  

  for(let i in alt) {
    //console.log(alt[i]);
    ctx.beginPath();
    ctx.arc(alt[i].pos.x - (x - canvas.width / 2), alt[i].pos.y - (y - canvas.height / 2), alt[i].pos.r, 0, Math.PI * 2);
    ctx.fillStyle = colors[alt[i].color];
    ctx.fill();
    ctx.font = `${Math.floor(alt[i].pos.r / 2.5)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(alt[i].user, alt[i].pos.x - (x - canvas.width / 2), alt[i].pos.y - (y - canvas.height / 2) + Math.floor(alt[i].pos.r / 2.5) / 2.5);
  }

  
  
  ctx.beginPath();
  ctx.arc(canvas.width / 2 + decalX, canvas.height / 2 + decalY, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors[color];
  ctx.fill();
  ctx.font = `${Math.floor(radius / 2.5)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(username, canvas.width / 2 + decalX, canvas.height / 2 + decalY + Math.floor(radius / 2.5) / 2.5);
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

document.onmousemove = e => {
  direction.x = e.clientX - canvas.width / 2;
  direction.y = e.clientY - canvas.height / 2;
  let amplitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
  if(amplitude > deadzone * radius * 2) {
    direction.x /= amplitude;
    direction.y /= amplitude;
  } else {
    direction.x = direction.x / amplitude * (amplitude / (deadzone * radius * 2))
    direction.y = direction.y / amplitude * (amplitude / (deadzone * radius * 2))
  }
  
  //console.log(direction.x, direction.y);
}

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