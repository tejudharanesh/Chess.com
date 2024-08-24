const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const RenderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  console.log(board);
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

        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { col: x, row: y };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            col: parseInt(squareElement.dataset.x),
            row: parseInt(squareElement.dataset.y),
          };

          HandleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });
};

const HandleMove = (source, target) => {
  // Implement your move logic here
};

const GetPieceUnicode = (piece) => {
  const unicodeMap = {
    p: { w: "♙", b: "♙" }, // Pawn
    r: { w: "♖", b: "♜" }, // Rook
    n: { w: "♘", b: "♞" }, // Knight
    b: { w: "♗", b: "♝" }, // Bishop
    q: { w: "♕", b: "♛" }, // Queen
    k: { w: "♔", b: "♚" }, // King
  };

  return unicodeMap[piece.type][piece.color];
};

RenderBoard();
