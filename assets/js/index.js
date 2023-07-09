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
let currentLevelConfig = LEVEL_SETTINGS[currentLevel];
let rows = currentLevelConfig.rows;
let columns = currentLevelConfig.cols;
let remainingMines = LEVEL_SETTINGS[currentLevel].mines;
let remainingFlags = remainingMines;
let totalCellsRevealed = 0;
let correctFlagsCount = 0;
let boardArray = [];
let gameFinish;

/**
 * Creates the game board by generating the HTML table structure.
 * Initializes the game board array.
 * Updates the remaining flags count displayed on the webpage.
 * Places the mines randomly on the board.
 * Counts the number of adjacent mines for each cell.
 */
function createBoard() {
  const BOARD_FRAGMENT = document.createDocumentFragment();

  BOARD.textContent = "";

  for (let i = 0; i < rows; i++) {
    const ROW = document.createElement("tr");
    boardArray[i] = [];

    for (let j = 0; j < columns; j++) {
      const CELL = document.createElement("td");
      boardArray[i][j] = 0;
      ROW.appendChild(CELL);
    }

    BOARD_FRAGMENT.appendChild(ROW);
  }

  BOARD.appendChild(BOARD_FRAGMENT);

  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  placeMines();
  countAdjacentMines();
}

/**
 * Randomly places the mines on the game board.
 * Updates the "boardArray" with the "mine" value for each mine location.
 */
function placeMines() {
  let minesToPlace = remainingMines;

  while (minesToPlace > 0) {
    const RANDOM_ROW = Math.floor(Math.random() * rows);
    const RANDOM_COL = Math.floor(Math.random() * columns);

    if (boardArray[RANDOM_ROW][RANDOM_COL] !== "mine") {
      boardArray[RANDOM_ROW][RANDOM_COL] = "mine";
      minesToPlace--;
    }
  }
}

/**
 * Counts the number of adjacent mines for each non-mine cell on the game board.
 * Updates the "boardArray" with the corresponding mine count for each cell.
 */
function countAdjacentMines() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (boardArray[row][col] !== "mine") {
        let minesCount = 0;

        for (let i = row - 1; i <= row + 1; i++) {
          for (let j = col - 1; j <= col + 1; j++) {
            const VALID_ROW = i >= 0 && i < rows;
            const VALID_COL = j >= 0 && j < columns;

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

/**
 * Reveals the content of a cell and handles game logic.
 *
 * @param {number} row - The row index of the cell.
 * @param {number} col - The column index of the cell.
 */
function revealCell(row, col) {
  const CELL = BOARD.rows[row].cells[col];

  if (CELL.classList.contains("flag") || CELL.textContent || gameFinish) return;

  if (boardArray[row][col] === "mine") {
    gameFinish = true;
    revealMines();
    alert("Game over! You hit a mine.");
  } else if (boardArray[row][col] === 0) {
    revealEmptyCells(row, col);
  } else {
    const NUMBER_CLASS = getNumberClass(boardArray[row][col]);
    CELL.textContent = boardArray[row][col];
    CELL.classList.add(NUMBER_CLASS);
  }

  totalCellsRevealed++;

  if (checkWin()) {
    gameFinish = true;
    alert("You win!");
    return;
  }
}

/**
 * Reveals empty cells surrounding the specified cell.
 *
 * @param {number} row - The row index of the cell.
 * @param {number} col - The column index of the cell.
 */
function revealEmptyCells(row, col) {
  const CELL = BOARD.rows[row].cells[col];

  if (CELL.textContent) return;

  CELL.classList.add("zero");

  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      const VALID_ROW = i >= 0 && i < rows;
      const VALID_COL = j >= 0 && j < columns;

      if (VALID_ROW && VALID_COL && !(i === row && j === col)) {
        const CELL = BOARD.rows[i].cells[j];
        if (!CELL.classList.value) revealCell(i, j);
      }
    }
  }
}

/**
 * Reveals all the mines on the game board.
 * Adds the "mine" class to the HTML elements representing mine cells.
 */
function revealMines() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (boardArray[i][j] === "mine") {
        const MINE_CELL = BOARD.rows[i].cells[j];
        MINE_CELL.classList.add("mine");
      }
    }
  }
}

/**
 * Returns the CSS class name for a given number.
 *
 * @param {number} number - The number of adjacent mines.
 * @returns {string} The CSS class name for the number.
 */
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

/**
 * Changes the game level to the specified level.
 *
 * @param {string} level - The level to change to.
 */
function changeLevel(level) {
  if (currentLevel === level) return;

  gameFinish = false;
  LEVEL_BUTTONS[currentLevel].classList.remove("active");
  currentLevel = level;
  LEVEL_BUTTONS[currentLevel].classList.add("active");

  currentLevelConfig = LEVEL_SETTINGS[currentLevel];
  rows = currentLevelConfig.rows;
  columns = currentLevelConfig.cols;
  remainingMines = currentLevelConfig.mines;
  remainingFlags = remainingMines;
  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  createBoard();
}

/**
 * Toggles the flag on a cell when the player right-clicks on it.
 *
 * @param {HTMLElement} cell - The HTML element representing the cell.
 */
function addFlagToCell(cell) {
  if (cell.classList.contains("zero") || cell.textContent || gameFinish) return;

  const HAS_FLAG = cell.classList.contains("flag");
  const ROW = cell.parentNode.rowIndex;
  const COL = cell.cellIndex;

  cell.classList.toggle("flag", !HAS_FLAG);
  remainingFlags += HAS_FLAG ? 1 : -1;
  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  if (!HAS_FLAG && boardArray[ROW][COL] === "mine") correctFlagsCount++;

  if (checkWin()) {
    gameFinish = true;
    alert("You win!");
    return;
  }
}

/**
 * Checks if the player has won the game.
 * Returns true if all non-mine cells have been revealed and all flags are correctly placed on mine cells.
 *
 * @returns {boolean} True if the player has won, false otherwise.
 */
function checkWin() {
  return (
    totalCellsRevealed === rows * columns - remainingMines &&
    correctFlagsCount === remainingMines
  );
}

/**
 * Resets the game by resetting the game variables and creating a new board.
 */
function newGame() {
  gameFinish = false;
  correctFlagsCount = 0;
  totalCellsRevealed = 0;
  remainingMines = currentLevelConfig.mines;
  remainingFlags = remainingMines;
  REMAINING_FLAGS_ELEMENT.textContent = remainingFlags;

  createBoard();
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
