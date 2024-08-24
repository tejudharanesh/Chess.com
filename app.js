const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const chess = new Chess();
let players = {};

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
    socket.emit("boardState", chess.fen());
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
    socket.emit("boardState", chess.fen());
  } else {
    socket.emit("gameFull");
  }

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    if (players.white === socket.id) {
      delete players.white;
    } else if (players.black === socket.id) {
      delete players.black;
    }
  });

  socket.on("move", (move) => {
    console.log("Move received:", move);
    if (
      (chess.turn() === "w" && socket.id === players.white) ||
      (chess.turn() === "b" && socket.id === players.black)
    ) {
      if (chess.move(move)) {
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        socket.emit("invalidMove", move);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
