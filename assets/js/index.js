const BOARD = document.getElementById("board");
const REMAINING_FLAGS_ELEMENT = document.getElementById("remaining-flags");
const NEW_GAME_BUTTON = document.getElementById("new-game");
const LEVEL_BUTTONS = {
  beginner: document.getElementById("beginner"),
  intermediate: document.getElementById("intermediate"),
  advanced: document.getElementById("advanced"),
};
const LEVEL_SETTINGS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  advanced: { rows: 16, cols: 30, mines: 99 },
};

let currentLevel = "beginner";
let remainingMines = LEVEL_SETTINGS[currentLevel].mines;
let remainingFlags = remainingMines;
let boardArray = [];
let gameOver;
let totalCellsRevealed = 0;
let correctFlagsCount = 0;

function createBoard() {
  const CURRENT_LEVEL_CONFIG = LEVEL_SETTINGS[currentLevel];
  const ROWS = CURRENT_LEVEL_CONFIG.rows;
  const COLUMNS = CURRENT_LEVEL_CONFIG.cols;
  const BOARD_FRAGMENT = document.createDocumentFragment();

  BOARD.textContent = "";

  for (let i = 0; i < ROWS; i++) {
    const ROW = document.createElement("tr");
    boardArray[i] = [];

    for (let j = 0; j < COLUMNS; j++) {
      const CELL = document.createElement("td");
      boardArray[i][j] = 0;
      ROW.appendChild(CELL);
    }

    BOARD_FRAGMENT.appendChild(ROW);
  }

  BOARD.appendChild(BOARD_FRAGMENT);

  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  placeMinesRandomly(remainingMines, ROWS, COLUMNS);
  countAdjacentMines(ROWS, COLUMNS);
}

function placeMinesRandomly(remainingMines, ROWS, COLUMNS) {
  const TOTAL_CELLS = ROWS * COLUMNS;

  let minesToPlace = remainingMines;

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const RANDOM_INDEX = Math.floor(Math.random() * (TOTAL_CELLS - i)) + i;
    const RANDOM_ROW = Math.floor(RANDOM_INDEX / COLUMNS);
    const RANDOM_COL = RANDOM_INDEX % COLUMNS;

    if (boardArray[RANDOM_ROW][RANDOM_COL] !== "mine") {
      boardArray[RANDOM_ROW][RANDOM_COL] = "mine";
      minesToPlace--;

      if (!minesToPlace) break;
    }
  }
}

function countAdjacentMines(ROWS, COLUMNS) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (boardArray[row][col] !== "mine") {
        let minesCount = 0;

        for (let i = row - 1; i <= row + 1; i++) {
          for (let j = col - 1; j <= col + 1; j++) {
            const VALID_ROW = i >= 0 && i < ROWS;
            const VALID_COL = j >= 0 && j < COLUMNS;

            if (VALID_ROW && VALID_COL && boardArray[i][j] === "mine") {
              minesCount++;
            }
          }
        }

        boardArray[row][col] = minesCount;
      }
    }
  }
}

function revealCell(row, col) {
  const CURRENT_LEVEL_CONFIG = LEVEL_SETTINGS[currentLevel];
  const ROWS = CURRENT_LEVEL_CONFIG.rows;
  const COLUMNS = CURRENT_LEVEL_CONFIG.cols;
  const CELL = BOARD.rows[row].cells[col];

  if (CELL.classList.contains("flag") || CELL.classList.value || gameOver)
    return;

  if (boardArray[row][col] === "mine") {
    gameOver = true;
    revealAllMines(ROWS, COLUMNS);
    alert("Game over! You hit a mine.");
  } else if (boardArray[row][col] === 0) {
    revealEmptyCells(row, col);
  } else {
    const NUMBER_CLASS = getNumberClass(boardArray[row][col]);
    CELL.textContent = boardArray[row][col];
    CELL.classList.add(NUMBER_CLASS);
  }

  totalCellsRevealed++;

  if (checkWin(ROWS, COLUMNS)) {
    gameOver = true;
    alert("You win!");
    return;
  }
}

function revealAllMines(rows, columns) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (boardArray[i][j] === "mine") {
        const MINE_CELL = BOARD.rows[i].cells[j];
        MINE_CELL.classList.add("mine");
      }
    }
  }
}

function revealEmptyCells(row, col) {
  const CURRENT_LEVEL_CONFIG = LEVEL_SETTINGS[currentLevel];
  const ROWS = CURRENT_LEVEL_CONFIG.rows;
  const COLUMNS = CURRENT_LEVEL_CONFIG.cols;
  const CELL = BOARD.rows[row].cells[col];

  if (
    CELL.classList.contains("zero") ||
    CELL.classList.contains("flag") ||
    CELL.textContent !== ""
  ) {
    return;
  }

  CELL.classList.add("zero");

  for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, ROWS - 1); i++) {
    for (
      let j = Math.max(0, col - 1);
      j <= Math.min(col + 1, COLUMNS - 1);
      j++
    ) {
      if (i !== row || j !== col) {
        revealCell(i, j);
      }
    }
  }
}

function getNumberClass(number) {
  switch (number) {
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    case 4:
      return "four";
    case 5:
      return "five";
    case 6:
      return "six";
    case 7:
      return "seven";
    case 8:
      return "eight";
    default:
      return "";
  }
}

function changeLevel(level) {
  if (currentLevel === level) return;

  gameOver = false;
  LEVEL_BUTTONS[currentLevel].classList.remove("active");
  currentLevel = level;
  LEVEL_BUTTONS[currentLevel].classList.add("active");

  remainingMines = LEVEL_SETTINGS[currentLevel].mines;
  remainingFlags = remainingMines;
  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  createBoard();
}

function addFlagToCell(cell) {
  if (cell.classList.contains("zero") || cell.textContent !== "" || gameOver) {
    return;
  }

  const HAS_FLAG = cell.classList.contains("flag");
  const ROW = cell.parentNode.rowIndex;
  const COL = cell.cellIndex;
  const CURRENT_LEVEL_CONFIG = LEVEL_SETTINGS[currentLevel];
  const ROWS = CURRENT_LEVEL_CONFIG.rows;
  const COLUMNS = CURRENT_LEVEL_CONFIG.cols;
  cell.classList.toggle("flag", !HAS_FLAG);
  remainingFlags += HAS_FLAG ? 1 : -1;
  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  if (!HAS_FLAG) {
    if (boardArray[ROW][COL] === "mine") correctFlagsCount++;
  }

  if (checkWin(ROWS, COLUMNS)) {
    gameOver = true;
    alert("You win!");
    return;
  }
}

function newGame() {
  const CELLS = document.querySelectorAll("td");

  CELLS.forEach((cell) => {
    cell.textContent = "";
    cell.className = "";
  });

  correctFlagsCount = 0;
  totalCellsRevealed = 0;
  remainingMines = LEVEL_SETTINGS[currentLevel].mines;
  remainingFlags = remainingMines;
  gameOver = false;
  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  createBoard();
}

function checkWin(rows, columns) {
  return (
    totalCellsRevealed === rows * columns - remainingMines &&
    correctFlagsCount === remainingMines
  );
}

document.addEventListener("click", (event) => {
  const TARGET = event.target;

  if (TARGET.tagName === "TD") {
    const ROW = TARGET.parentNode.rowIndex;
    const COL = TARGET.cellIndex;
    revealCell(ROW, COL);
  } else if (TARGET === LEVEL_BUTTONS["beginner"]) {
    changeLevel("beginner");
  } else if (TARGET === LEVEL_BUTTONS["intermediate"]) {
    changeLevel("intermediate");
  } else if (TARGET === LEVEL_BUTTONS["advanced"]) {
    changeLevel("advanced");
  } else if (TARGET === NEW_GAME_BUTTON) {
    newGame();
  }
});

document.addEventListener("contextmenu", (event) => {
  const TARGET = event.target;

  if (TARGET.tagName === "TD") {
    event.preventDefault();
    addFlagToCell(TARGET);
  }
});

createBoard();
