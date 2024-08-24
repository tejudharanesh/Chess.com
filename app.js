const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", function (socket) {
  console.log(socket.id);

  if (!players.white) {
    players.white = socket.id;
    socket.emit("player role", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("player role", "b");
  } else {
    socket.emit("game full");
  }

  socket.on("disconnect", function () {
    if (players.white === socket.id) {
      delete players.white;
    } else if (players.black === socket.id) {
      delete players.black;
    }
  });

  socket.on("move", (move) => {
    console.log(move);
    try {
      if (chess.turn() === "w" && socket.id !== players.white) return;
      if (chess.turn() === "b" && socket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move");
        socket.emit("invalid Move", move);
      }
    } catch (err) {
      console.log(err);
      socket.emit("Invalid move", move);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
