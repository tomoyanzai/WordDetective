document.addEventListener("DOMContentLoaded", initializeGame);

let currentWordIndex = 0;
let score = 0;
let currentGuess = "";
let hintUsed = false;
let currentDifficulty = "beginner";
let hintIndex = 0;
let storyIntroDisplayed = false;
let dailyChallenge;

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

    const wordLadderElement = document.getElementById("word-ladder");
    if (wordLadderElement) {
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
    }

    setupGuessDisplay();
    createKeyboard();
    updateScore();
    resetHint();
}

function displayTheme() {
    const themeDisplay = document.getElementById("theme-display");
    if (themeDisplay) {
        themeDisplay.textContent = `Today's Theme: ${dailyChallenge.theme}`;
    }
}

function displayStoryIntro() {
    const storyIntroElement = document.getElementById("story-intro");
    if (storyIntroElement) {
        storyIntroElement.textContent = dailyChallenge.story_intro;
        storyIntroElement.style.display = "block";
    }
}

function setupGuessDisplay() {
    const guessDisplay = document.getElementById("guess-display");
    if (guessDisplay) {
        guessDisplay.innerHTML = `
            <div class="guess-input"></div>
            <div class="guess-placeholder"></div>
        `;
    }
}

function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    if (!keyboard) return;

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
            keyElement.addEventListener("click", () => handleKeyPress(key));
            rowElement.appendChild(keyElement);
        });
        keyboard.appendChild(rowElement);
    });
}

function handleKeyPress(key) {
    const currentWord = dailyChallenge[currentDifficulty][currentWordIndex].word;
    
    if (key === "Enter") {
        submitGuess();
    } else if (key === "Del") {
        currentGuess = currentGuess.slice(0, -1);
    } else if (currentGuess.length < currentWord.length) {
        currentGuess += key.toLowerCase();
    }
    updateGuessDisplay();
}

function updateGuessDisplay() {
    const guessDisplay = document.getElementById("guess-display");
    const guessInput = guessDisplay.querySelector(".guess-input");
    
    if (guessInput) {
        if (currentGuess.length > 0) {
            guessInput.textContent = currentGuess.toUpperCase();
            guessDisplay.classList.add("has-input");
        } else {
            guessInput.textContent = "";
            guessDisplay.classList.remove("has-input");
        }
    }
}

function resetHint() {
    const hintElement = document.getElementById("hint");
    if (hintElement) {
        hintElement.textContent = "";
    }
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
    disableUsedKeys(currentGuess, currentWord);

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
            resetKeyColors();
            setMessage("Correct! Next word.");
            setupGuessDisplay();
            resetHint();
        }
    } else {
        setMessage("Incorrect. Try again.");
    }

    currentGuess = "";
    updateGuessDisplay();
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

function disableUsedKeys(guess, correctWord) {
    const keyboardKeys = document.getElementsByClassName("key");
    for (let i = 0; i < guess.length; i++) {
        const keyElement = Array.from(keyboardKeys).find(
            (key) => key.textContent.toLowerCase() === guess[i]
        );
        if (keyElement && !correctWord.includes(guess[i])) {
            keyElement.classList.add("key-disabled");
            keyElement.disabled = true;
        }
    }
}

function resetKeyColors() {
    const keyboardKeys = document.getElementsByClassName("key");
    Array.from(keyboardKeys).forEach((key) => {
        key.classList.remove("key-disabled");
        key.disabled = false;
    });
}

function setMessage(msg) {
    const messageElement = document.getElementById("message");
    if (messageElement) {
        messageElement.textContent = msg;
    }
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }
}

function getHint() {
    const hintElement = document.getElementById("hint");
    const currentWordHints = dailyChallenge[currentDifficulty][currentWordIndex].hint;
    if (hintElement && currentWordHints) {
        if (hintIndex < currentWordHints.length) {
            hintElement.textContent = currentWordHints[hintIndex];
            hintIndex++;
            hintUsed = true;
        } else {
            hintElement.textContent = "No more hints available.";
        }
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }
}

setInitialTheme();

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Backspace" || /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        if (e.key === "Enter") {
            submitGuess();
        } else if (e.key === "Backspace") {
            handleKeyPress("Del");
        } else {
            handleKeyPress(e.key.toUpperCase());
        }
    }
});