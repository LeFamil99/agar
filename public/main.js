const socket = io();

console.log("Vlad")
const loginPage = document.getElementsByClassName("login")[0];
const login = document.getElementById("login");
const user = document.getElementById("user");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

//-------------------- Variables

//Movement
let direction = {x: 0, y: 0};
let deadzone = 1;
let decalRange = 20;
let decalX = 0;
let decalY = 0;

//Players
let x = 200;
let y = 200;
let radius = 20;
let velX = 0;
let velY = 0;
let alt = [];
//let arrRight = false, arrLeft = false, arrUp = false, arrDown = false;
let username;
let color;
let score = 20;
let speed = 50 / (score + 1) + 2.5;
let dead = false
let immune;

//Map
let spacing = 50;
let mapWidth = 2000;
let mapHeight = 1000;
let borderThickness = 100000;

//Food
let food;
let foodRadius = 10;

const colors = [
  '#0066ff', '#00ffff', '#00ff00', '#99ff33',
  '#ffff00', '#ffcc66', '#ff0000', '#ff0066',
  '#cc0099', '#9933ff', '#3333ff', '#ccccff'
];

/*ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(100, 100);
ctx.stroke();*/

const frame = () => {


  if(!dead){
    //-------------------- Movement
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

    //-------------------- Drawing

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Border
    /*ctx.lineWidth = borderThickness;
    ctx.beginPath();
    ctx.moveTo(-x + canvas.width / 2 - borderThickness / 2, -y + canvas.height / 2 - borderThickness / 2);
    ctx.lineTo(-x + canvas.width / 2 - borderThickness / 2, mapHeight - y + canvas.height / 2 + borderThickness / 2);
    ctx.lineTo(mapWidth - x + canvas.width / 2 + borderThickness / 2, mapHeight - y + canvas.height / 2 + borderThickness / 2);
    ctx.lineTo(mapWidth - x + canvas.width / 2 + borderThickness / 2, -y + canvas.height / 2 - borderThickness / 2);
    ctx.lineTo(-x + canvas.width / 2 - borderThickness / 2, -y + canvas.height / 2 - borderThickness / 2);
    ctx.stroke();*/

    //Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#cccccc";
    for (let i = -x % spacing; i <= window.innerWidth; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, window.innerHeight);
      ctx.stroke();

    }
    for (let i = -y % spacing; i <= window.innerHeight; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(window.innerWidth, i);
      ctx.stroke();
    }


    /*for (let i = -x % spacing; i <= window.innerWidth; i += spacing) {
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
    }*/

    //Food
    for(let i in food) {
      if(Math.sqrt((food[i].x - x) ** 2 + (food[i].y - y) ** 2) < radius + foodRadius) {
        socket.emit("eaten", i);
        score++;
        //console.log(score)
        radius = Math.sqrt(score * 20);
        speed = 50 / (score + 1) + 2.5
      }
      //console.log(Math.sqrt((food[i].x - x) ** 2 + (food[i].y - y) ** 2));
      //console.log(alt[i]);
      ctx.beginPath();
      ctx.arc(food[i].x - (x - canvas.width / 2), food[i].y - (y - canvas.height / 2), foodRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors[food[i].color];
      ctx.fill();
    }

    //Other Players
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
      
      if(Math.sqrt((alt[i].pos.x - x) ** 2 + (alt[i].pos.y - y) ** 2) < radius - alt[i].pos.r * 0.2 && radius > alt[i].pos.r && !alt[i].pos.immune) {
        console.log("Touch", i, alt);
        let idd = alt[i].id;
        score += alt[i].pos.score;
        alt.splice(i, 1);
        //console.log(alt);
        //console.log(score)
        radius = Math.sqrt(score * 20);
        speed = 50 / (score + 1) + 2.5
        socket.emit("kill", idd);
      }
    }

    //Player
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
      x: x + decalX,
      y: y + decalY,
      r: radius,
      immune: immune,
      score: score
    })
  
    window.requestAnimationFrame(frame);
  }
}

const reset = () => {
  //Movement
  direction = {x: 0, y: 0};
  deadzone = 1;
  decalRange = 20;
  decalX = 0;
  decalY = 0;

  //Players
  x = 200;
  y = 200;
  radius = 20;
  velX = 0;
  velY = 0;
  alt = [];
  //let arrRight = false, arrLeft = false, arrUp = false, arrDown = false;
  username;
  color;
  score = 20;
  speed = 50 / (score + 1) + 2.5;
  dead = false
  immune = true;

  //Map
  spacing = 50;
  mapWidth = 2000;
  mapHeight = 1000;
  borderThickness = 100000;

  //Food
  food;
  foodRadius = 10;


  dead = false

  socket.emit("noname");
  setTimeout(() => {
    immune = false;
  }, 2000);
}



/*document.addEventListener("keydown", e => {

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
});*/

//-------------------- Event listeners

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
    //user.value = "";
    loginPage.style.display = "none";
    reset();
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

socket.on("food", foodArr => {
  //console.log(food);
  food = foodArr
});

socket.on("kill", id => {
  dead = true
  loginPage.style.display = "block";
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