// utils.js

export function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
}

export function getTileClass(letter, index, currentWord) {
  if (letter === currentWord[index]) {
    return "correct";
  } else if (currentWord.includes(letter)) {
    return "present";
  } else {
    return "absent";
  }
}
