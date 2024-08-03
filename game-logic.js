// game-logic.js
import { getCurrentDate } from "./utils.js";

export function loadWord(quizzes, wordLength = 5) {
  const currentDate = getCurrentDate();
  const quiz = quizzes[currentDate];
  if (quiz) {
    const eligibleWords = quiz.words.filter(
      (wordObj) => wordObj.word.length === wordLength
    );
    if (eligibleWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligibleWords.length);
      return eligibleWords[randomIndex];
    } else {
      console.error(
        `No words with length ${wordLength} found for today's date`
      );
    }
  } else {
    console.error("No quiz found for today's date");
  }
  return null;
}

export function checkGuess(guess, currentWord) {
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

  return result;
}
