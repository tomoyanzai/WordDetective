// script.js
import { getCurrentDate } from "./utils.js";
import { loadWord, checkGuess } from "./game-logic.js";
import {
  createCurrentGuessDisplay,
  createKeyboard,
  updateCurrentGuessDisplay,
  updateKeyboardColor,
  updateMiniHistory,
  updateProgress,
  toggleTheme,
} from "./ui.js";

let currentWord = "";
let guesses = [];
let currentGuess = [];
let currentRow = 0;
let hints = [];
let revealedHints = 1;

function initializeGame() {
  const wordData = loadWord(quizzes);
  if (wordData) {
    currentWord = wordData.word.toUpperCase();
    hints = wordData.clues;
    createCurrentGuessDisplay();
    createHintDisplay();
    createKeyboard(handleKeyPress);
    updateProgress(currentRow);
    document
      .getElementById("theme-toggle")
      .addEventListener("click", toggleTheme);
  } else {
    console.error("Failed to load word data");
    // Handle error (e.g., display a message to the user)
  }
}

function createHintDisplay() {
  const hintSection = document.getElementById("hint-section");
  const hintContainer = document.getElementById("hint-container");
  hintContainer.innerHTML = "";

  hints.forEach((hint, index) => {
    const hintElement = document.createElement("div");
    hintElement.className = `hint ${index === 0 ? "revealed" : ""}`;
    hintElement.id = `hint${index + 1}`;
    hintElement.textContent = index === 0 ? hint : "";
    hintContainer.appendChild(hintElement);
  });

  const revealButton = document.getElementById("reveal-hint-btn");
  revealButton.addEventListener("click", revealNextHint);
}

function revealNextHint() {
  if (revealedHints < hints.length) {
    revealedHints++;
    const hintElement = document.getElementById(`hint${revealedHints}`);
    hintElement.textContent = hints[revealedHints - 1];
    hintElement.classList.add("revealed");

    if (revealedHints === hints.length) {
      document.getElementById("reveal-hint-btn").disabled = true;
    }
  }
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
    updateCurrentGuessDisplay(currentGuess);
  }
}

function deleteLetter() {
  if (currentGuess.length > 0) {
    currentGuess.pop();
    updateCurrentGuessDisplay(currentGuess);
  }
}

function submitGuess() {
  const guess = currentGuess.join("");
  guesses.push(guess);
  const result = checkGuess(guess, currentWord);
  updateUI(guess, result);
  currentGuess = [];
  currentRow++;
  if (guess === currentWord) {
    endGame(true);
  } else if (guesses.length === 5) {
    endGame(false);
  }
}

function updateUI(guess, result) {
  updateCurrentGuessDisplay(currentGuess);
  updateMiniHistory(guesses, currentWord);
  updateProgress(currentRow);
  for (let i = 0; i < 5; i++) {
    updateKeyboardColor(guess[i], result[i]);
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

document.addEventListener("DOMContentLoaded", initializeGame);
document.addEventListener("keydown", handleKeyPress);
