//this is meant to mimic the NYT sudoku game. it is supposed to autmaically create a new random sudoku board, check that it is indeed solvable, and check for errors.

const boardElement = document.getElementById("sudoku-board");
const newGameBtn = document.getElementById("new-game");

function createEmptyBoard() {
  boardElement.innerHTML = "";
  const cells = [];

  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.maxLength = 1;
    input.type = "text";
    cells.push(input);
    boardElement.appendChild(input);
  }

  return cells;
}

function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const boxCol = 3 * Math.floor(col / 3) + (i % 3);
      if (board[boxRow][boxCol] === num) return false;
    }
    return true;
  }

  function fillBoard(pos = 0) {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;

    const nums = [...Array(9).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
    for (const num of nums) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (fillBoard(pos + 1)) return true;
        board[row][col] = 0;
      }
    }

    return false;
  }

  fillBoard();
  return board;
}

function generatePuzzle(fullBoard, holes = 40) {
  const puzzle = fullBoard.map(row => row.slice());
  while (holes > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      holes--;
    }
  }
  return puzzle;
}

function renderPuzzle(puzzle, cells) {
  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const val = puzzle[row][col];
    const cell = cells[i];
    cell.value = val === 0 ? "" : val;
    cell.disabled = val !== 0;
  }
}

function startGame() {
  const cells = createEmptyBoard();
  const fullBoard = generateFullBoard();
  const puzzle = generatePuzzle(fullBoard, 40);
  renderPuzzle(puzzle, cells);
}

newGameBtn.addEventListener("click", startGame);
startGame();
