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
let currentPlayer = "W";

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", (socket) => {
  //unique information from socket
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
