// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isAIMode = true;
let scoreX = 0;
let scoreO = 0;

// Winning combinations
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

// DOM elements
const boardElement = document.getElementById('board');
const statusMsg = document.getElementById('statusMsg');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const vsHumanBtn = document.getElementById('vsHumanBtn');
const vsAIBtn = document.getElementById('vsAIBtn');
const gameOverPopup = document.getElementById('gameOverPopup');
const popupTitle = document.getElementById('popupTitle');
const popupSubtitle = document.getElementById('popupSubtitle');
const popupEmoji = document.getElementById('popupEmoji');
const popupResetBtn = document.getElementById('popupResetBtn');

// Initialize game
function init() {
    updateScores();
    resetGame();
    
    vsHumanBtn.addEventListener('click', () => {
        isAIMode = false;
        vsHumanBtn.classList.add('active');
        vsAIBtn.classList.remove('active');
        resetGame();
    });
    
    vsAIBtn.addEventListener('click', () => {
        isAIMode = true;
        vsAIBtn.classList.add('active');
        vsHumanBtn.classList.remove('active');
        resetGame();
    });
    
    popupResetBtn.addEventListener('click', () => {
        hideGameOverPopup();
        resetGame();
    });
}

// Reset game board
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusMsg.innerHTML = isAIMode && currentPlayer === 'O' ? "AI is thinking... 🤖" : "Player X's turn (❌)";
    statusMsg.style.color = '#FFFFFF';
    
    // Clear winner highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('winner', 'X', 'O');
        cell.textContent = '';
    });
}

// Make a move
function makeMove(index) {
    if (!gameActive || board[index] !== '') return false;
    
    // Place the mark
    board[index] = currentPlayer;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);
    
    // Check win/draw
    if (checkWin()) {
        gameActive = false;
        statusMsg.innerHTML = `🎉 Player ${currentPlayer} wins! 🎉`;
        statusMsg.style.color = currentPlayer === 'X' ? '#00F5D4' : '#F15BB5';
        if (currentPlayer === 'X') {
            scoreX++;
            updateScores();
        } else {
            scoreO++;
            updateScores();
        }
        highlightWinningCombo();
        showGameOverPopup(`Player ${currentPlayer} won!`, 'Nice move!', '🏆');
        return true;
    }
    
    if (checkDraw()) {
        gameActive = false;
        statusMsg.innerHTML = "🤝 It's a draw! 🤝";
        statusMsg.style.color = '#FF6600';
        showGameOverPopup("It's a tie!", 'Better luck next round', '🤝');
        return true;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusMsg.innerHTML = getTurnMessage();
    
    // Trigger AI move if in AI mode and game still active
    if (isAIMode && gameActive && currentPlayer === 'O') {
        setTimeout(() => aiMove(), 300);
    }
    
    return true;
}

// Get turn message
function getTurnMessage() {
    if (isAIMode && currentPlayer === 'O') {
        return "AI is thinking... 🤖";
    }
    return `Player ${currentPlayer}'s turn ${currentPlayer === 'X' ? '❌' : '⭕'}`;
}

// AI move using minimax algorithm (unbeatable)
function aiMove() {
    if (!gameActive || currentPlayer !== 'O') return;
    
    const bestMove = getBestMove();
    if (bestMove !== -1) {
        makeMove(bestMove);
    }
}

// Get best move for AI using minimax
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

// Minimax algorithm
function minimax(boardState, depth, isMaximizing) {
    // Check terminal states
    const winner = checkWinnerOnBoard(boardState);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(boardState)) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'O';
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'X';
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check winner on a given board
function checkWinnerOnBoard(boardState) {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

// Check if board is full
function isBoardFull(boardState) {
    return boardState.every(cell => cell !== '');
}

// Check win on current board
function checkWin() {
    return checkWinnerOnBoard(board) !== null;
}

// Check draw
function checkDraw() {
    return isBoardFull(board) && !checkWin();
}

// Highlight winning cells
function highlightWinningCombo() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            document.querySelector(`.cell[data-index="${a}"]`).classList.add('winner');
            document.querySelector(`.cell[data-index="${b}"]`).classList.add('winner');
            document.querySelector(`.cell[data-index="${c}"]`).classList.add('winner');
            break;
        }
    }
}

// Update scores display
function updateScores() {
    scoreXElement.textContent = scoreX;
    scoreOElement.textContent = scoreO;
}

// Reset scores
function resetScores() {
    scoreX = 0;
    scoreO = 0;
    updateScores();
    resetGame();
}

// Handle cell clicks
function handleCellClick(e) {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    
    const index = parseInt(cell.dataset.index);
    
    // Check if it's AI mode and it's AI's turn
    if (isAIMode && currentPlayer === 'O') {
        statusMsg.innerHTML = "Wait for AI to move... 🤖";
        return;
    }
    
    makeMove(index);
}

// Event listeners
boardElement.addEventListener('click', handleCellClick);

// Popup helpers
function showGameOverPopup(title, subtitle, emoji) {
    if (!gameOverPopup || !popupTitle || !popupSubtitle || !popupEmoji || !popupResetBtn) return;
    popupTitle.textContent = title;
    popupSubtitle.textContent = subtitle;
    popupEmoji.textContent = emoji || '🎮';
    gameOverPopup.classList.add('show');
    if (popupResetBtn) popupResetBtn.focus();
}

function hideGameOverPopup() {
    if (!gameOverPopup) return;
    gameOverPopup.classList.remove('show');
}

// Start game
init();
