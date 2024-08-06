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

    // Add this line to set up the 'How to Play' button
    document
      .getElementById("show-how-to-play")
      .addEventListener("click", showHowToPlay);

    document
      .getElementById("show-feedback")
      .addEventListener("click", function () {
        window.open(
          "https://docs.google.com/forms/d/e/1FAIpQLSfenrOG0o8XF8wsE_rd18YKVg_W-DAXvI7uMoS1omlta4zBwA/viewform?usp=sf_link",
          "_blank"
        );
      });

    // Optionally, show the dialog for first-time players
    if (!localStorage.getItem("hasPlayedBefore")) {
      showHowToPlay();
      localStorage.setItem("hasPlayedBefore", "true");
    }
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

// How to Play
function showHowToPlay() {
  const dialog = document.getElementById("how-to-play-dialog");
  dialog.classList.add("show");
}

function closeHowToPlay(event) {
  // Prevent the event from bubbling up to the dialog
  event.stopPropagation();
  const dialog = document.getElementById("how-to-play-dialog");
  dialog.classList.remove("show");
}

// Make sure these event listeners are added in your initializeGame function or when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const showButton = document.getElementById("show-how-to-play");
  const closeButton = document.getElementById("close-dialog");
  const dialog = document.getElementById("how-to-play-dialog");

  if (showButton) showButton.addEventListener("click", showHowToPlay);
  if (closeButton) closeButton.addEventListener("click", closeHowToPlay);

  // Prevent clicks inside the dialog from closing it
  dialog
    .querySelector(".dialog-content")
    .addEventListener("click", function (event) {
      event.stopPropagation();
    });

  // Close the dialog when clicking outside of it
  dialog.addEventListener("click", closeHowToPlay);
});
