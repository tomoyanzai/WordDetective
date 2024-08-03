// ui.js
import { getTileClass } from "./utils.js";

export function createCurrentGuessDisplay() {
  const currentGuessElement = document.getElementById("current-guess");
  for (let i = 0; i < 5; i++) {
    const tile = document.createElement("div");
    tile.className = "current-tile tile";
    currentGuessElement.appendChild(tile);
  }
}

export function createKeyboard(handleKeyPress) {
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

export function updateCurrentGuessDisplay(currentGuess) {
  const currentTiles = document.querySelectorAll(".current-tile");
  for (let i = 0; i < 5; i++) {
    currentTiles[i].textContent = currentGuess[i] || "";
    currentTiles[i].className = `current-tile tile ${
      currentGuess[i] ? "filled" : ""
    }`;
  }
}

export function updateKeyboardColor(letter, status) {
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

export function updateMiniHistory(guesses, currentWord) {
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
        j,
        currentWord
      )}`;
      tile.textContent = guesses[i][j];
      row.appendChild(tile);
    }
    miniHistory.appendChild(row);
  }
}

export function updateProgress(currentRow) {
  document.getElementById("progress").textContent = `Guess ${currentRow + 1}/5`;
}

export function toggleTheme() {
  const newTheme =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "dark"
      : "light";
  document.documentElement.setAttribute("data-theme", newTheme);

  // Update hint section styles
  const hintSection = document.getElementById("hint-section");
  const hints = document.querySelectorAll(".hint");
  const revealButton = document.getElementById("reveal-hint-btn");

  if (newTheme === "dark") {
    hintSection.style.boxShadow = "0 2px 4px rgba(255, 255, 255, 0.1)";
    hints.forEach((hint) => {
      hint.style.backgroundColor = "var(--tile-background-dark)";
      if (hint.classList.contains("revealed")) {
        hint.style.backgroundColor = "var(--color-present-dark)";
      }
    });
    revealButton.style.backgroundColor = "var(--color-correct-dark)";
  } else {
    hintSection.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    hints.forEach((hint) => {
      hint.style.backgroundColor = "var(--tile-background)";
      if (hint.classList.contains("revealed")) {
        hint.style.backgroundColor = "var(--color-present)";
      }
    });
    revealButton.style.backgroundColor = "var(--color-correct)";
  }
}
