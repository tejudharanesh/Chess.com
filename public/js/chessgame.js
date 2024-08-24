const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let selectedPiece = null;
let possibleMoves = [];

const RenderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, y) => {
    row.forEach((square, x) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (x + y) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.x = x;
      squareElement.dataset.y = y;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerHTML = GetPieceUnicode(square);
        pieceElement.dataset.x = x;
        pieceElement.dataset.y = y;

        pieceElement.addEventListener("click", () => {
          HandlePieceClick(x, y, square);
        });

        squareElement.appendChild(pieceElement);
      }

      if (possibleMoves.some((move) => move.x === x && move.y === y)) {
        squareElement.classList.add("highlight");
        squareElement.addEventListener("click", () => {
          HandleMove(selectedPiece, { x, y });
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
};

const HandlePieceClick = (x, y, square) => {
  selectedPiece = { x, y, square };
  possibleMoves = chess
    .moves({ square: `${String.fromCharCode(97 + x)}${8 - y}`, verbose: true })
    .map((move) => {
      const col = move.to.charCodeAt(0) - 97;
      const row = 8 - parseInt(move.to[1], 10);
      return { x: col, y: row };
    });
  RenderBoard();
};

const HandleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.x)}${8 - source.y}`,
    to: `${String.fromCharCode(97 + target.x)}${8 - target.y}`,
    promotion: "q",
  };
  socket.emit("move", move);
  possibleMoves = [];
  selectedPiece = null;
};

const GetPieceUnicode = (piece) => {
  const unicodeMap = {
    p: { w: "♙", b: "♟" },
    r: { w: "♖", b: "♜" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };

  return unicodeMap[piece.type][piece.color];
};

socket.on("playerRole", function (role) {
  playerRole = role;
  RenderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  RenderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  RenderBoard();
});

socket.on("gameFull", function () {
  alert("Game is full. Please try again later.");
});

socket.on("invalidMove", function (move) {
  alert("Invalid move. Try again.");
});

RenderBoard();
