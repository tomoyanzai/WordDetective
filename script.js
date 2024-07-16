let currentWordIndex = 0;
let score = 0;
let currentGuess = "";
let hintUsed = false;
let currentDifficulty = "beginner";
let hintIndex = 0;
let storyIntroDisplayed = false;
let dailyChallenge = null;
let wordInput;

document.addEventListener("DOMContentLoaded", initializeGame);

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayQuiz() {
  const todayDate = getTodayDate();
  return quizzes[todayDate];
}

function initializeGame() {
  dailyChallenge = getTodayQuiz();
  
  if (!storyIntroDisplayed) {
    displayStoryIntro();
    storyIntroDisplayed = true;
  }
  displayTheme();
  setBackgroundImage();

  const wordLadderElement = document.getElementById("word-ladder");
  wordLadderElement.innerHTML = "";
  dailyChallenge[currentDifficulty].forEach((wordObj, index) => {
    const wordRow = document.createElement("div");
    wordRow.className = "word-row";
    wordRow.id = `word-${index}`;
    for (let i = 0; i < wordObj.word.length; i++) {
      const letterElement = document.createElement("div");
      letterElement.className = "letter";
      wordRow.appendChild(letterElement);
    }
    wordLadderElement.appendChild(wordRow);
  });
  
  resetHint();
  updateScore();

  wordInput = document.getElementById('word-input');
  wordInput.addEventListener('input', handleInput);
  wordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      submitGuess();
    }
  });
  wordInput.maxLength = dailyChallenge[currentDifficulty][currentWordIndex].word.length;
  wordInput.placeholder = `Enter a ${wordInput.maxLength}-letter word`;

  createKeyboard();
}

function displayTheme() {
  const themeDisplay = document.getElementById("theme-display");
  themeDisplay.textContent = `Today's Theme: ${dailyChallenge.theme}`;
}

function displayStoryIntro() {
  const storyIntroElement = document.getElementById("story-intro");
  if (storyIntroElement) {
    storyIntroElement.textContent = dailyChallenge.story_intro;
    storyIntroElement.style.display = "block";
  }
}

function setBackgroundImage() {
  const gameContainer = document.getElementById("game-container");
  if (dailyChallenge && dailyChallenge.background) {
    gameContainer.style.backgroundImage = `url('images/${dailyChallenge.background}')`;
    gameContainer.style.backgroundSize = "cover";
    gameContainer.style.backgroundPosition = "center";
    gameContainer.style.backgroundRepeat = "no-repeat";
  }
}

function createKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  const layout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Del"],
  ];

  layout.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";
    row.forEach((key) => {
      const keyElement = document.createElement("button");
      keyElement.className = "key";
      keyElement.textContent = key;
      if (key === "Enter" || key === "Del") {
        keyElement.classList.add("key-wide");
      }
      keyElement.addEventListener('click', () => handleKeyPress(key));
      rowElement.appendChild(keyElement);
    });
    keyboard.appendChild(rowElement);
  });
}

function handleKeyPress(key) {
  if (key === "Enter") {
    submitGuess();
  } else if (key === "Del") {
    wordInput.value = wordInput.value.slice(0, -1);
    handleInput({ target: wordInput });
  } else if (wordInput.value.length < wordInput.maxLength) {
    wordInput.value += key.toLowerCase();
    handleInput({ target: wordInput });
  }
  wordInput.focus();
}

function handleInput(event) {
  currentGuess = event.target.value.toLowerCase();
}

function resetHint() {
  document.getElementById("hint").textContent = "";
  hintUsed = false;
  hintIndex = 0;
}

function submitGuess() {
  const currentWord = dailyChallenge[currentDifficulty][currentWordIndex].word;

  if (currentGuess.length !== currentWord.length) {
    setMessage(`Please enter a ${currentWord.length}-letter word.`);
    return;
  }

  updateWordRow(currentGuess, currentWord);

  if (currentGuess === currentWord) {
    score += hintUsed ? 5 : 10;
    currentWordIndex++;
    if (currentWordIndex >= dailyChallenge[currentDifficulty].length) {
      if (currentDifficulty === "beginner") {
        currentDifficulty = "intermediate";
        currentWordIndex = 0;
        initializeGame();
        setMessage("Great job! Moving to intermediate level.");
      } else if (currentDifficulty === "intermediate") {
        currentDifficulty = "advanced";
        currentWordIndex = 0;
        initializeGame();
        setMessage("Excellent! Moving to advanced level.");
      } else {
        setMessage("Congratulations! You've completed all levels! 🎉");
      }
    } else {
      setMessage("Correct! Next word.");
      resetHint();
      wordInput.maxLength = dailyChallenge[currentDifficulty][currentWordIndex].word.length;
      wordInput.placeholder = `Enter a ${wordInput.maxLength}-letter word`;
    }
  } else {
    setMessage("Incorrect. Try again.");
  }

  wordInput.value = '';
  currentGuess = '';
  updateScore();
}

function updateWordRow(guess, correctWord) {
  const wordRow = document.getElementById(`word-${currentWordIndex}`);
  const letters = wordRow.getElementsByClassName("letter");

  for (let i = 0; i < guess.length; i++) {
    letters[i].textContent = guess[i].toUpperCase();
    if (guess[i] === correctWord[i]) {
      letters[i].className = "letter correct";
    } else if (correctWord.includes(guess[i])) {
      letters[i].className = "letter wrong-position";
    } else {
      letters[i].className = "letter incorrect";
    }
  }
}

function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

function setMessage(message) {
  document.getElementById("message").textContent = message;
}

function getHint() {
  const currentWord = dailyChallenge[currentDifficulty][currentWordIndex];
  if (hintIndex === 0) {
    document.getElementById("hint").textContent = currentWord.definition;
    hintIndex++;
  } else if (hintIndex <= currentWord.hints.length) {
    document.getElementById("hint").textContent = currentWord.hints[hintIndex - 1];
    hintIndex++;
  } else {
    setMessage("No more hints available for this word.");
  }
  hintUsed = true;
}

function toggleTheme() {
  const root = document.documentElement;
  if (root.getAttribute('data-theme') === 'light') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
  }
}