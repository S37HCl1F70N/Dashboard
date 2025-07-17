
// Sudoku Game Logic
const sudokuGrid = document.getElementById('sudoku-grid');
const timerDisplay = document.getElementById('timer');
const errorCounterDisplay = document.getElementById('error-counter');
const difficultyDisplay = document.getElementById('difficulty-display'); // New element
const normalModeToggle = document.getElementById('normal-mode-toggle'); // Changed ID
const candidateModeToggle = document.getElementById('candidate-mode-toggle'); // Changed ID
const eraseButton = document.getElementById('erase-button');
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');
const newGameButton = document.getElementById('new-game-button');
const settingsButton = document.getElementById('settings-button');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsButton = document.getElementById('close-settings-button');
const numberPad = document.getElementById('number-pad'); // Changed to getElementById
const solveSound = document.getElementById('solve-sound');
const autoCandidateCheckboxInput = document.getElementById('auto-candidate-checkbox-input'); // New element for checkbox

// Message Box elements
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageOkButton = document.getElementById('message-ok-button');

let board = []; // Current game board state
let solution = []; // The solved board
let initialBoard = []; // The initial puzzle with fixed numbers
let candidates = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())); // Pencil marks
let selectedCell = { row: -1, col: -1 };
let history = []; // Stores { row, col, oldValue, newValue, oldCandidates, newCandidates, isNotesModeChange }
let historyPointer = -1;
let isNotesMode = false; // Corresponds to "Candidate" mode
let timerInterval;
let seconds = 0;
let errors = 0;
let isGameSolved = false;

// Default Settings
let settings = {
    difficulty: 'medium', // New setting for difficulty
    checkGuesses: false,
    autoCandidateMode: false,
    showErrorCounter: true,
    showTimer: true,
    highlightConflicts: true,
    highlightRowCol: true,
    highlightBox: true,
    highlightIdentical: true,
    playSoundOnSolve: true,
};

// --- Utility Functions ---

// Shuffle array for randomizing numbers in board generation
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Checks if a number is valid in a given cell (row, col, 3x3 box)
function isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num && x !== col) {
            return false;
        }
    }
    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num && x !== row) {
            return false;
        }
    }
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const r_check = startRow + i;
            const c_check = startCol + j;
            if (grid[r_check][c_check] === num && (r_check !== row || c_check !== col)) {
                return false;
            }
        }
    }
    return true;
}

// Backtracking function to fill the Sudoku grid (generates a full, valid board)
function fillGrid(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of numbers) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (fillGrid(grid)) {
                            return true;
                        }
                        grid[row][col] = 0; // Backtrack
                    }
                }
                return false; // No number works
            }
        }
    }
    return true; // Grid is filled
}

// Solver function to check if a puzzle is solvable and find a solution
function solveSudoku(grid) {
    const tempGrid = grid.map(row => [...row]); // Create a deep copy to avoid modifying original
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (tempGrid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(tempGrid, row, col, num)) {
                        tempGrid[row][col] = num;
                        if (solveSudoku(tempGrid)) {
                            return true; // Solution found
                        }
                        tempGrid[row][col] = 0; // Backtrack
                    }
                }
                return false; // No number works
            }
        }
    }
    return true; // Grid is solved
}

// --- Game Initialization & Board Generation ---

function generateSudoku() {
    isGameSolved = false;
    seconds = 0;
    errors = 0;
    updateTimerDisplay();
    updateErrorCounterDisplay();
    stopTimer();

    // 1. Create a fully solved Sudoku grid
    solution = Array(9).fill(0).map(() => Array(9).fill(0));
    fillGrid(solution); // This should populate 'solution' with a complete, valid board

    // 2. Create the puzzle by removing numbers based on difficulty
    // Start with a deep copy of the solved board for initial puzzle
    initialBoard = solution.map(row => [...row]);

    let cellsToRemoveCount;
    switch (settings.difficulty) {
        case 'easy':
            cellsToRemoveCount = 35 + Math.floor(Math.random() * 5); // 35-39 cells removed
            break;
        case 'medium':
            cellsToRemoveCount = 45 + Math.floor(Math.random() * 5); // 45-49 cells removed
            break;
        case 'hard':
            cellsToRemoveCount = 55 + Math.floor(Math.random() * 5); // 55-59 cells removed
            break;
        default:
            cellsToRemoveCount = 45 + Math.floor(Math.random() * 5); // Default to medium
    }

    let removed = 0;
    let attempts = 0;
    const maxAttemptsForRemoval = 5000; // Increased attempts to ensure enough cells are removed

    // Create a list of all cell positions and shuffle them
    const allCellPositions = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            allCellPositions.push({ r, c });
        }
    }
    shuffleArray(allCellPositions);

    // Iterate through shuffled positions to remove cells
    for (const { r, c } of allCellPositions) {
        if (removed >= cellsToRemoveCount) break; // Stop if enough cells are removed

        if (initialBoard[r][c] !== 0) { // Only try to remove if it's not already empty
            const originalValue = initialBoard[r][c];
            initialBoard[r][c] = 0; // Temporarily remove the number

            // Create a copy of the current puzzle state to check solvability
            const tempPuzzle = initialBoard.map(row => [...row]);
            if (solveSudoku(tempPuzzle)) {
                // If it's still solvable, keep the cell removed
                removed++;
            } else {
                // If not solvable, put the number back
                initialBoard[r][c] = originalValue;
            }
        }
        attempts++;
        if (attempts > maxAttemptsForRemoval && removed < cellsToRemoveCount) {
            // Fallback: if we can't remove enough cells while maintaining solvability,
            // just proceed with the current state to avoid infinite loops.
            // This might result in an easier puzzle than intended for 'hard'.
            console.warn("Could not remove desired number of cells while maintaining solvability.");
            break;
        }
    }

    // The 'board' for gameplay starts as 'initialBoard'
    board = initialBoard.map(row => [...row]);
    candidates = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
    history = [];
    historyPointer = -1;
    selectedCell = { row: -1, col: -1 };

    // If auto candidate mode is on, update candidates immediately after board generation
    if (settings.autoCandidateMode) {
        isNotesMode = true;
        normalModeToggle.classList.remove('active');
        candidateModeToggle.classList.add('active');
        updateAllCandidates(); // Call this when auto candidate is on
    } else {
        isNotesMode = false;
        normalModeToggle.classList.add('active');
        candidateModeToggle.classList.remove('active');
    }

    renderBoard();
    startTimer();
    updateDifficultyDisplay();
}

// --- UI Rendering ---

function renderBoard() {
    sudokuGrid.innerHTML = ''; // Clear existing grid
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (initialBoard[r][c] !== 0) {
                cell.classList.add('fixed');
                cell.innerHTML = `<div class="value">${initialBoard[r][c]}</div>`;
            } else if (board[r][c] !== 0) {
                cell.innerHTML = `<div class="value">${board[r][c]}</div>`;
                // Apply correct/incorrect class if checkGuesses is on
                if (settings.checkGuesses && board[r][c] !== solution[r][c]) {
                    cell.classList.add('incorrect-guess');
                } else if (settings.checkGuesses) {
                    cell.classList.add('correct-guess');
                }
            } else {
                // Render candidates
                const candidateContainer = document.createElement('div');
                candidateContainer.classList.add('candidates');
                for (let i = 1; i <= 9; i++) {
                    const candidateNum = document.createElement('span');
                    candidateNum.classList.add('candidate-num');
                    if (candidates[r][c].has(i)) {
                        candidateNum.textContent = i;
                    }
                    candidateContainer.appendChild(candidateNum);
                }
                cell.appendChild(candidateContainer);
            }

            cell.addEventListener('click', () => selectCell(r, c));
            sudokuGrid.appendChild(cell);
        }
    }
    applyHighlighting();
    checkWinCondition();
}

// Function to update all candidates on the board
function updateAllCandidates() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (initialBoard[r][c] === 0 && board[r][c] === 0) { // Only for empty user cells
                candidates[r][c].clear();
                for (let num = 1; num <= 9; num++) {
                    // Temporarily place the number to check validity
                    board[r][c] = num; // Temporarily place on the *current* board state
                    if (isValid(board, r, c, num)) { // Check validity against *current* board state
                        candidates[r][c].add(num);
                    }
                    board[r][c] = 0; // Remove temporary number
                }
            } else {
                candidates[r][c].clear(); // Clear candidates for filled cells
            }
        }
    }
    renderBoard(); // Re-render to show updated candidates
}

function selectCell(row, col) {
    // Deselect previous cell
    if (selectedCell.row !== -1 && selectedCell.col !== -1) {
        const prevCell = document.querySelector(`.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
        if (prevCell) {
            prevCell.classList.remove('selected');
        }
    }

    selectedCell = { row, col };

    // Select new cell
    const currentCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (currentCell) {
        currentCell.classList.add('selected');
    }
    applyHighlighting();
}

function applyHighlighting() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('highlight-row-col-box', 'highlight-identical', 'conflict', 'correct-guess', 'incorrect-guess');
    });

    if (selectedCell.row === -1 || selectedCell.col === -1) return;

    const r = selectedCell.row;
    const c = selectedCell.col;
    const selectedValue = board[r][c];

    // Highlight row, column, and box
    if (settings.highlightRowCol || settings.highlightBox) {
        for (let i = 0; i < 9; i++) {
            const rowCell = document.querySelector(`.cell[data-row="${r}"][data-col="${i}"]`);
            const colCell = document.querySelector(`.cell[data-row="${i}"][data-col="${c}"]`);
            if (settings.highlightRowCol) {
                if (rowCell) rowCell.classList.add('highlight-row-col-box');
                if (colCell) colCell.classList.add('highlight-row-col-box');
            }
        }

        if (settings.highlightBox) {
            const startRow = Math.floor(r / 3) * 3;
            const startCol = Math.floor(c / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const boxCell = document.querySelector(`.cell[data-row="${startRow + i}"][data-col="${startCol + j}"]`);
                    if (boxCell) boxCell.classList.add('highlight-row-col-box');
                }
            }
        }
    }

    // Highlight identical numbers
    if (settings.highlightIdentical && selectedValue !== 0) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === selectedValue) {
                    document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`).classList.add('highlight-identical');
                }
            }
        }
    }

    // Highlight conflicts
    if (settings.highlightConflicts && board[r][c] !== 0) {
        const conflicts = getConflicts(r, c, board[r][c]);
        conflicts.forEach(pos => {
            document.querySelector(`.cell[data-row="${pos.row}"][data-col="${pos.col}"]`).classList.add('conflict');
        });
        if (conflicts.length > 0) {
            document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`).classList.add('conflict');
        }
    }

    // Re-apply selected class last to ensure it's on top
    const currentCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    if (currentCell) {
        currentCell.classList.add('selected');
    }
}

// Get conflicting cells for a given number at (row, col)
function getConflicts(row, col, num) {
    const conflicts = [];
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num && x !== col) {
            conflicts.push({ row, col: x });
        }
    }
    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num && x !== row) {
            conflicts.push({ row: x, col });
        }
    }
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const r_check = startRow + i;
            const c_check = startCol + j;
            if (board[r_check][c_check] === num && (r_check !== row || c_check !== col)) {
                conflicts.push({ row: r_check, col: c_check });
            }
        }
    }
    return conflicts;
}

// --- Game Actions ---

function recordHistory(row, col, oldValue, newValue, oldCandidates, newCandidates, isNotesModeChange = false) {
    // Clear future history if a new move is made
    if (historyPointer < history.length - 1) {
        history = history.slice(0, historyPointer + 1);
    }
    history.push({
        row,
        col,
        oldValue,
        newValue,
        oldCandidates: oldCandidates ? new Set(oldCandidates) : null, // Store a copy, handle null
        newCandidates: newCandidates ? new Set(newCandidates) : null, // Store a copy, handle null
        isNotesModeChange
    });
    historyPointer++;
}

function undoMove() {
    if (historyPointer >= 0) {
        const lastMove = history[historyPointer];
        const { row, col, oldValue, oldCandidates, isNotesModeChange } = lastMove;

        if (isNotesModeChange) {
            isNotesMode = !isNotesMode;
            updateModeButtons();
        } else {
            // Only update error counter if it was a number entry (not notes) and `checkGuesses` is on
            if (initialBoard[row][col] === 0 && oldValue !== null && settings.checkGuesses) {
                // If the current value was incorrect, decrement errors
                if (board[row][col] !== 0 && board[row][col] !== solution[row][col]) {
                    errors--;
                }
                // If the old value (being restored) was incorrect, increment errors
                if (oldValue !== 0 && oldValue !== solution[row][col]) {
                    errors++;
                }
                updateErrorCounterDisplay();
            }

            board[row][col] = oldValue;
            candidates[row][col] = oldCandidates ? new Set(oldCandidates) : new Set();
        }
        historyPointer--;
        renderBoard();
        if (settings.autoCandidateMode) updateAllCandidates(); // Update candidates after undo
    }
}

function redoMove() {
    if (historyPointer < history.length - 1) {
        historyPointer++;
        const nextMove = history[historyPointer];
        const { row, col, newValue, newCandidates, isNotesModeChange } = nextMove;

        if (isNotesModeChange) {
            isNotesMode = !isNotesMode;
            updateModeButtons();
        } else {
            // Only update error counter if it was a number entry (not notes) and `checkGuesses` is on
            if (initialBoard[row][col] === 0 && newValue !== null && settings.checkGuesses) {
                // If the current value was incorrect, decrement errors
                if (board[row][col] !== 0 && board[row][col] !== solution[row][col]) {
                    errors--;
                }
                // If the new value (being restored) is incorrect, increment errors
                if (newValue !== 0 && newValue !== solution[row][col]) {
                    errors++;
                }
                updateErrorCounterDisplay();
            }

            board[row][col] = newValue;
            candidates[row][col] = newCandidates ? new Set(newCandidates) : new Set();
        }
        renderBoard();
        if (settings.autoCandidateMode) updateAllCandidates(); // Update candidates after redo
    }
}

function enterNumber(num) {
    if (selectedCell.row === -1 || selectedCell.col === -1 || isGameSolved) return;

    const r = selectedCell.row;
    const c = selectedCell.col;

    if (initialBoard[r][c] !== 0) {
        showMessage("You cannot change fixed numbers!");
        return;
    }

    const oldValue = board[r][c];
    const oldCandidates = new Set(candidates[r][c]);

    if (isNotesMode) {
        // Toggle candidate
        if (candidates[r][c].has(num)) {
            candidates[r][c].delete(num);
        } else {
            candidates[r][c].add(num);
        }
        recordHistory(r, c, oldValue, board[r][c], oldCandidates, candidates[r][c]);
    } else {
        // Enter number
        if (oldValue !== 0 && settings.checkGuesses) {
            if (oldValue !== solution[r][c]) {
                errors--; // Decrement error if previous value was incorrect
            }
        }

        if (board[r][c] === num) { // If same number is entered, clear it
            board[r][c] = 0;
        } else {
            board[r][c] = num;
        }

        // If a number is entered, clear candidates for that cell
        candidates[r][c].clear();

        recordHistory(r, c, oldValue, board[r][c], oldCandidates, candidates[r][c]);

        if (settings.checkGuesses && board[r][c] !== 0 && board[r][c] !== solution[r][c]) {
            errors++;
        }
        updateErrorCounterDisplay();
    }
    renderBoard();
    if (settings.autoCandidateMode) updateAllCandidates(); // Update candidates after number entry
}

function eraseCell() {
    if (selectedCell.row === -1 || selectedCell.col === -1 || isGameSolved) return;

    const r = selectedCell.row;
    const c = selectedCell.col;

    if (initialBoard[r][c] !== 0) {
        showMessage("You cannot erase fixed numbers!");
        return;
    }

    const oldValue = board[r][c];
    const oldCandidates = new Set(candidates[r][c]);

    if (oldValue !== 0 && settings.checkGuesses) {
        if (oldValue !== solution[r][c]) {
            errors--; // Decrement error if previous value was incorrect
        }
    }

    board[r][c] = 0;
    candidates[r][c].clear();

    recordHistory(r, c, oldValue, 0, oldCandidates, new Set());
    updateErrorCounterDisplay();
    renderBoard();
    if (settings.autoCandidateMode) updateAllCandidates(); // Update candidates after erase
}

function updateModeButtons() {
    if (isNotesMode) {
        normalModeToggle.classList.remove('active');
        candidateModeToggle.classList.add('active');
    } else {
        normalModeToggle.classList.add('active');
        candidateModeToggle.classList.remove('active');
    }
}

function checkWinCondition() {
    if (isGameSolved) return; // Already solved

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
                return false; // Not solved or incorrect
            }
        }
    }
    isGameSolved = true;
    stopTimer();
    showMessage("Congratulations! You solved the Sudoku!");
    if (settings.playSoundOnSolve) {
        solveSound.play();
    }
    return true; // Solved!
}

// --- Timer and Error Counter ---

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Clear any existing timer
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplay.textContent = `TIME: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    timerDisplay.style.display = settings.showTimer ? 'block' : 'none';
}

function updateErrorCounterDisplay() {
    errorCounterDisplay.textContent = `ERRORS: ${errors}`;
    errorCounterDisplay.style.display = settings.showErrorCounter ? 'block' : 'none';
}

function updateDifficultyDisplay() {
    difficultyDisplay.textContent = `DIFFICULTY: ${settings.difficulty.toUpperCase()}`;
}

// --- Settings Panel ---

function loadSettings() {
    const savedSettings = localStorage.getItem('sudokuSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    // Apply initial settings
    updateSettingsUI();
    updateTimerDisplay();
    updateErrorCounterDisplay();
    updateDifficultyDisplay(); // Update difficulty display on load
    // Set auto candidate checkbox state directly
    autoCandidateCheckboxInput.checked = settings.autoCandidateMode;
    isNotesMode = settings.autoCandidateMode;
    updateModeButtons(); // Ensure mode buttons reflect initial state
}

function saveSettings() {
    localStorage.setItem('sudokuSettings', JSON.stringify(settings));
}

function updateSettingsUI() {
    // Update general settings toggles
    document.getElementById('check-guesses-toggle').textContent = settings.checkGuesses ? 'ON' : 'OFF';
    document.getElementById('check-guesses-toggle').classList.toggle('on', settings.checkGuesses);
    document.getElementById('check-guesses-toggle').classList.toggle('off', !settings.checkGuesses);

    document.getElementById('show-error-counter-toggle').textContent = settings.showErrorCounter ? 'ON' : 'OFF';
    document.getElementById('show-error-counter-toggle').classList.toggle('on', settings.showErrorCounter);
    document.getElementById('show-error-counter-toggle').classList.toggle('off', !settings.showErrorCounter);
    errorCounterDisplay.style.display = settings.showErrorCounter ? 'block' : 'none';

    document.getElementById('show-timer-toggle').textContent = settings.showTimer ? 'ON' : 'OFF';
    document.getElementById('show-timer-toggle').classList.toggle('on', settings.showTimer);
    document.getElementById('show-timer-toggle').classList.toggle('off', !settings.showTimer);
    timerDisplay.style.display = settings.showTimer ? 'block' : 'none';

    document.getElementById('highlight-conflicts-toggle').textContent = settings.highlightConflicts ? 'ON' : 'OFF';
    document.getElementById('highlight-conflicts-toggle').classList.toggle('on', settings.highlightConflicts);
    document.getElementById('highlight-conflicts-toggle').classList.toggle('off', !settings.highlightConflicts);

    document.getElementById('highlight-row-col-toggle').textContent = settings.highlightRowCol ? 'ON' : 'OFF';
    document.getElementById('highlight-row-col-toggle').classList.toggle('on', settings.highlightRowCol);
    document.getElementById('highlight-row-col-toggle').classList.toggle('off', !settings.highlightRowCol);

    document.getElementById('highlight-box-toggle').textContent = settings.highlightBox ? 'ON' : 'OFF';
    document.getElementById('highlight-box-toggle').classList.toggle('on', settings.highlightBox);
    document.getElementById('highlight-box-toggle').classList.toggle('off', !settings.highlightBox);

    document.getElementById('highlight-identical-toggle').textContent = settings.highlightIdentical ? 'ON' : 'OFF';
    document.getElementById('highlight-identical-toggle').classList.toggle('on', settings.highlightIdentical);
    document.getElementById('highlight-identical-toggle').classList.toggle('off', !settings.highlightIdentical);

    document.getElementById('play-sound-solve-toggle').textContent = settings.playSoundOnSolve ? 'ON' : 'OFF';
    document.getElementById('play-sound-solve-toggle').classList.toggle('on', settings.playSoundOnSolve);
    document.getElementById('play-sound-solve-toggle').classList.toggle('off', !settings.playSoundOnSolve);

    // Update difficulty buttons
    document.querySelectorAll('.difficulty-button').forEach(button => {
        if (button.dataset.difficulty === settings.difficulty) {
            button.classList.add('selected-difficulty');
        } else {
            button.classList.remove('selected-difficulty');
        }
    });

    renderBoard(); // Re-render to apply highlighting changes
}

function toggleSetting(settingName) {
    settings[settingName] = !settings[settingName];
    saveSettings();
    updateSettingsUI();
}

function setDifficulty(difficulty) {
    if (settings.difficulty !== difficulty) {
        settings.difficulty = difficulty;
        saveSettings();
        updateSettingsUI();
        generateSudoku(); // Generate new board with new difficulty
    }
}

// --- Message Box ---
function showMessage(msg) {
    messageText.textContent = msg;
    messageBox.style.display = 'block';
}

function hideMessageBox() {
    messageBox.style.display = 'none';
}

// --- Event Listeners ---

window.onload = function() {
    // Generate number buttons dynamically
    for (let i = 1; i <= 9; i++) {
        const numButton = document.createElement('button');
        numButton.classList.add('number-button');
        numButton.innerHTML = `<span>${i}</span>`;
        numButton.addEventListener('click', () => enterNumber(i));
        numberPad.appendChild(numButton);
    }

    // Initialize the board first
    generateSudoku();
    // Then load settings, which will update the UI based on the newly generated board
    loadSettings();

    // Control buttons
    normalModeToggle.addEventListener('click', () => {
        isNotesMode = false;
        updateModeButtons();
        recordHistory(-1, -1, null, null, null, null, true);
    });
    candidateModeToggle.addEventListener('click', () => {
        isNotesMode = true;
        updateModeButtons();
        recordHistory(-1, -1, null, null, null, null, true);
    });

    eraseButton.addEventListener('click', eraseCell);
    undoButton.addEventListener('click', undoMove);
    redoButton.addEventListener('click', redoMove);
    newGameButton.addEventListener('click', generateSudoku);
    settingsButton.addEventListener('click', () => settingsPanel.classList.add('open'));
    closeSettingsButton.addEventListener('click', () => settingsPanel.classList.remove('open'));

    // Settings toggles
    document.getElementById('check-guesses-toggle').addEventListener('click', () => toggleSetting('checkGuesses'));
    // autoCandidateMode is now handled by the checkbox
    autoCandidateCheckboxInput.addEventListener('change', (e) => {
        settings.autoCandidateMode = e.target.checked;
        saveSettings();
        isNotesMode = settings.autoCandidateMode; // Update current mode
        updateModeButtons(); // Update mode buttons visually
        if (settings.autoCandidateMode) {
            updateAllCandidates();
        } else {
            // Clear all candidates if auto mode is turned off
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    candidates[r][c].clear();
                }
            }
            renderBoard();
        }
    });

    document.getElementById('show-error-counter-toggle').addEventListener('click', () => toggleSetting('showErrorCounter'));
    document.getElementById('show-timer-toggle').addEventListener('click', () => toggleSetting('showTimer'));
    document.getElementById('highlight-conflicts-toggle').addEventListener('click', () => toggleSetting('highlightConflicts'));
    document.getElementById('highlight-row-col-toggle').addEventListener('click', () => toggleSetting('highlightRowCol'));
    document.getElementById('highlight-box-toggle').addEventListener('click', () => toggleSetting('highlightBox'));
    document.getElementById('highlight-identical-toggle').addEventListener('click', () => toggleSetting('highlightIdentical'));
    document.getElementById('play-sound-solve-toggle').addEventListener('click', () => toggleSetting('playSoundOnSolve'));

    // Difficulty buttons
    document.getElementById('difficulty-easy').addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('difficulty-medium').addEventListener('click', () => setDifficulty('medium'));
    document.getElementById('difficulty-hard').addEventListener('click', () => setDifficulty('hard'));

    messageOkButton.addEventListener('click', hideMessageBox);

    // Keyboard input
    document.addEventListener('keydown', (e) => {
        if (messageBox.style.display === 'block') { // If message box is open, only allow OK
            if (e.key === 'Enter' || e.key === 'Escape') {
                hideMessageBox();
            }
            return;
        }

        if (settingsPanel.classList.contains('open')) { // If settings panel is open
            if (e.key === 'Escape') {
                settingsPanel.classList.remove('open');
            }
            return;
        }

        const key = e.key;
        const code = e.code; // Get the code to distinguish numpad keys

        let numToEnter = 0;

        // Handle regular number keys (1-9)
        if (key >= '1' && key <= '9') {
            numToEnter = parseInt(key);
        }
        // Handle Numpad keys (Numpad1-Numpad9)
        else if (code.startsWith('Numpad') && code.length === 7) { // e.g., "Numpad1", "Numpad9"
            const numpadDigit = parseInt(code.charAt(6));
            if (numpadDigit >= 1 && numpadDigit <= 9) {
                numToEnter = numpadDigit;
            } else if (numpadDigit === 0) { // Numpad0 acts as erase
                eraseCell();
                return; // Exit as action is handled
            }
        }

        if (numToEnter !== 0) {
            enterNumber(numToEnter);
        } else if (key === 'Backspace' || key === 'Delete') {
            eraseCell();
        } else if (key === 'n' || key === 'N') { // Toggle to Candidate mode
            isNotesMode = true;
            updateModeButtons();
            recordHistory(-1, -1, null, null, null, null, true);
        } else if (key === 'm' || key === 'M') { // Toggle to Normal mode
            isNotesMode = false;
            updateModeButtons();
            recordHistory(-1, -1, null, null, null, null, true);
        }
        else if (key === 'z' || key === 'Z' && (e.ctrlKey || e.metaKey)) {
            undoMove();
        } else if (key === 'y' || key === 'Y' && (e.ctrlKey || e.metaKey)) {
            redoMove();
        } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            e.preventDefault(); // Prevent page scrolling
            if (selectedCell.row === -1) { // If no cell selected, select first
                selectCell(0, 0);
                return;
            }
            let newRow = selectedCell.row;
            let newCol = selectedCell.col;
            if (key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
            else if (key === 'ArrowDown') newRow = Math.min(8, newRow + 1);
            else if (key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
            else if (key === 'ArrowRight') newCol = Math.min(8, newCol + 1);
            selectCell(newRow, newCol);
        }
    });
};
