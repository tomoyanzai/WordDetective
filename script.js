let currentWord = "";
let guesses = [];
let currentGuess = [];
let currentRow = 0;

function initializeGame() {
  loadWord();
  createCurrentGuessDisplay();
  displayClues();
  createKeyboard();
  updateProgress();
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);
}

function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
}

function loadWord() {
  const currentDate = getCurrentDate();
  const quiz = quizzes[currentDate];
  if (quiz) {
    currentWord = quiz.words[0].word.toUpperCase();
  } else {
    console.error("No quiz found for today's date");
    // Fallback to a default quiz or show an error message
  }
}

function displayClues() {
  const currentDate = getCurrentDate();
  const clues = quizzes[currentDate].words[0].clues;
  const cluesContainer = document.getElementById("clues-container");
  cluesContainer.innerHTML = "";
  clues.forEach((clue) => {
    const clueElement = document.createElement("div");
    clueElement.className = "clue";
    clueElement.textContent = clue;
    cluesContainer.appendChild(clueElement);
  });
}

function createCurrentGuessDisplay() {
  const currentGuessElement = document.getElementById("current-guess");
  for (let i = 0; i < 5; i++) {
    const tile = document.createElement("div");
    tile.className = "current-tile tile";
    currentGuessElement.appendChild(tile);
  }
}

function createKeyboard() {
  const keyboard = document.getElementById("keyboard");
  const layout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
  ];

  layout.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";
    row.forEach((key) => {
      const keyElement = document.createElement("button");
      keyElement.className = "key";
      keyElement.textContent = key;
      keyElement.setAttribute("data-key", key);
      if (key === "ENTER" || key === "DEL") {
        keyElement.classList.add("wide");
      }
      keyElement.addEventListener("click", () => handleKeyPress({ key }));
      rowElement.appendChild(keyElement);
    });
    keyboard.appendChild(rowElement);
  });
}

function handleKeyPress(e) {
  if (guesses.length === 5) return;

  const key = e.key.toUpperCase();
  if (key === "ENTER") {
    if (currentGuess.length === 5) {
      submitGuess();
    }
  } else if (key === "BACKSPACE" || key === "DEL") {
    deleteLetter();
  } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
    addLetter(key);
  }
}

function addLetter(letter) {
  if (currentGuess.length < 5) {
    currentGuess.push(letter);
    updateCurrentGuessDisplay();
  }
}

function deleteLetter() {
  if (currentGuess.length > 0) {
    currentGuess.pop();
    updateCurrentGuessDisplay();
  }
}

function submitGuess() {
  const guess = currentGuess.join("");
  guesses.push(guess);
  checkGuess(guess);
  currentGuess = [];
  currentRow++;
  updateCurrentGuessDisplay();
  updateMiniHistory();
  if (guess === currentWord) {
    endGame(true);
  } else if (guesses.length === 5) {
    endGame(false);
  }
  updateProgress();
}

function updateCurrentGuessDisplay() {
  const currentTiles = document.querySelectorAll(".current-tile");
  for (let i = 0; i < 5; i++) {
    currentTiles[i].textContent = currentGuess[i] || "";
    currentTiles[i].className = `current-tile tile ${
      currentGuess[i] ? "filled" : ""
    }`;
  }
}

function getTileClass(letter, index) {
  if (letter === currentWord[index]) {
    return "correct";
  } else if (currentWord.includes(letter)) {
    return "present";
  } else {
    return "absent";
  }
}

function checkGuess(guess) {
  const letterCount = {};
  for (let letter of currentWord) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  const result = new Array(5).fill("absent");

  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    if (guess[i] === currentWord[i]) {
      result[i] = "correct";
      letterCount[guess[i]]--;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (
      result[i] !== "correct" &&
      currentWord.includes(guess[i]) &&
      letterCount[guess[i]] > 0
    ) {
      result[i] = "present";
      letterCount[guess[i]]--;
    }
  }

  // Update keyboard colors
  for (let i = 0; i < 5; i++) {
    updateKeyboardColor(guess[i], result[i]);
  }
}

function updateKeyboardColor(letter, status) {
  const key = document.querySelector(`button[data-key="${letter}"]`);
  if (key) {
    if (status === "correct") {
      key.style.backgroundColor = "var(--color-correct)";
      key.style.color = "white";
    } else if (
      status === "present" &&
      key.style.backgroundColor !== "var(--color-correct)"
    ) {
      key.style.backgroundColor = "var(--color-present)";
      key.style.color = "white";
    } else if (status === "absent" && !key.style.backgroundColor) {
      key.style.backgroundColor = "var(--color-absent)";
      key.style.color = "white";
    }
  }
}

function updateMiniHistory() {
  const miniHistory = document.getElementById("mini-history");
  miniHistory.innerHTML = "";
  const start = Math.max(0, guesses.length - 2);
  for (let i = start; i < guesses.length; i++) {
    const row = document.createElement("div");
    row.className = "mini-history-row";
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = `mini-history-tile tile ${getTileClass(
        guesses[i][j],
        j
      )}`;
      tile.textContent = guesses[i][j];
      row.appendChild(tile);
    }
    miniHistory.appendChild(row);
  }
}

function endGame(isWin) {
  let message;
  if (isWin) {
    message = "Congratulations! You guessed the word!";
  } else {
    message = `Game over. The word was ${currentWord}.`;
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowDate = tomorrow.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
  });

  message += `\n\nThank you for playing today's Word Detective!\nA new word will be waiting for you on ${tomorrowDate}.\nCome back tomorrow to challenge your vocabulary skills again!`;

  alert(message);

  document.removeEventListener("keydown", handleKeyPress);

  document.getElementById("game-area").style.opacity = "0.5";
  document.getElementById("keyboard").style.pointerEvents = "none";
}

function updateProgress() {
  document.getElementById("progress").textContent = `Guess ${currentRow + 1}/5`;
}

function toggleTheme() {
  document.documentElement.setAttribute(
    "data-theme",
    document.documentElement.getAttribute("data-theme") === "light"
      ? "dark"
      : "light"
  );
}

document.addEventListener("DOMContentLoaded", initializeGame);
document.addEventListener("keydown", handleKeyPress);
