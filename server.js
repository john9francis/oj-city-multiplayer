// the express server in charge of multiplayer.

const { dir } = require('console');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Set the correct MIME type for JavaScript files
app.use('/dist', express.static('dist', { 'Content-Type': 'application/javascript' }));
// Serve the assets folder:
app.use('/assets', express.static('assets'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// player name stuff:
// names for guests
firstNames = [
  "Oafish",
  "Obedient",
  "Obliging",
  "Obscene",
  "Obnoxious",
  "Odd",
  "Old",
  "Observent",
  "Obsessed",
  "Obtuse",
  "Oblivious",
  "Odorous",
  "Off-key",
  "Off-kilter",
  "Offensive",
  "Okay",
  "Old-School",
  "Olympic",
  "Ominous",
  "One-Legged",
  "Outstanding",
  "Overrated",
  "Overworked"
]

lastNames = [
  "Jacket",
  "Janitor",
  "Jaw",
  "Jar",
  "Jeans",
  "Jewel",
  "Joint",
  "Journal",
  "Judge",
  "Juice",
  "Jumble",
  "Jackal",
  "Jalapeno",
  "Jester",
  "Jinx",
  "Java",
  "Jailer",
  "Jasmine",
  "Jaundice",
  "Javelin",
  "Jet",
  "Jello",
  "Jellyfish",
  "Joke",
  "Jock",
  "Juror",
  "Jugular"
]

randFromArray = (array) => {
  const i = Math.floor(Math.random() * array.length)
  return array[i]
}

// HANDLE PLAYERS
let players = new Map() 

// what happens right on connection
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.send("you connected", socket.id)

  socket.on("request id", ()=> {
    socket.emit("your id", socket.id)
  })

  // set the users info
  // MAIN AREA SPAWN: ex.vec(2560/2 - 90 ,2560/2 - 180);
  let playerInfo = {
    name : randFromArray(firstNames) 
      + " " 
      + randFromArray(lastNames),
    posx : 1190,
    posy : 1100,
    area : ""
  }

  // add player to players map
  // NOTE: use something different than socket.id
  players.set(socket.id, playerInfo)

  socket.on('disconnect', () => {
    console.log('user disconnected');

    io.emit("player disconnected", socket.id)

    // remove player from players
    players.delete(socket.id)
  });

  socket.on('moving', (direction) => {

    // send to everyone that this player is moving
    io.emit("moving", [socket.id, direction])
  })

  socket.on('stop', (direction)=> {

    // send to everyone that this player stopped moving
    io.emit("stopped moving", [socket.id, direction])
  })

  socket.on("my position", (pos)=> {
    playerInfo.posx = pos[0],
    playerInfo.posy = pos[1]
  })

  
  // send all players the player data periodically
  setInterval(() => {
    const object = Object.fromEntries(players)
    const jsonString = JSON.stringify(object)
    
    // send over json string
    socket.emit("players", jsonString)

    // ask player for position
    // NOTE: make this "info please" and we can get their scene too
    socket.emit("position please", socket.id)

  }, 100);


});