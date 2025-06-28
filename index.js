const colors = ["red", "green", "blue", "yellow", "orange", "purple"];
const codeLength = 4;
const maxGuesses = 10;
let secretCode = [];
let currentRow = 0;
let gameOver = false;
let selectedColor = null;

const board = document.getElementById("board");
const checkGuess = document.getElementById("check-guess");
const message = document.getElementById("message");
const restart = document.getElementById("restart");
const allowDuplicates = document.getElementById("allow-duplicates");
const startGameButton = document.getElementById("start-game");

function generateSecretCode(allowDuplicates) {
  console.log(
    "Generating new secret code with duplicates allowed:",
    allowDuplicates
  );
  const availableColors = [...colors];
  const code = [];
  for (let i = 0; i < codeLength; i++) {
    if (allowDuplicates) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      code.push(colors[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      code.push(availableColors.splice(randomIndex, 1)[0]);
    }
  }
  console.log("Generated secret code:", code);
  return code;
}

function getFeedback(guess, code) {
  console.log("Calculating feedback for guess:", guess);
  let red = 0;
  let white = 0;
  const guessCopy = [...guess];
  const codeCopy = [...code];

  for (let i = 0; i < codeLength; i++) {
    if (guessCopy[i] === codeCopy[i]) {
      red++;
      guessCopy[i] = null;
      codeCopy[i] = null;
    }
  }

  for (let i = 0; i < codeLength; i++) {
    if (guessCopy[i] !== null) {
      const index = codeCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        white++;
        codeCopy[index] = null;
      }
    }
  }

  const black = codeLength - red - white;
  console.log(
    "Feedback calculated: red:",
    red,
    "white:",
    white,
    "black:",
    black
  );
  return { red, white, black };
}

function startGame() {
  console.log("Starting new game");
  secretCode = generateSecretCode(allowDuplicates.checked);
  currentRow = 0;
  gameOver = false;
  message.textContent = "";
  restart.style.display = "none";
  checkGuess.disabled = true;
  board.innerHTML = "";
  createBoard();
  addColorChoiceListeners();
  addPegListeners(currentRow);
  selectedColor = null;
  document
    .querySelectorAll(".color-choice")
    .forEach((c) => c.classList.remove("selected"));
}

function createBoard() {
  console.log("Creating game board with", maxGuesses, "rows");
  for (let i = 0; i < maxGuesses; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < codeLength; j++) {
      const peg = document.createElement("div");
      peg.classList.add("peg");
      peg.style.backgroundColor = "white";
      row.appendChild(peg);
    }
    const feedback = document.createElement("div");
    feedback.classList.add("feedback");
    for (let j = 0; j < codeLength; j++) {
      const feedbackPeg = document.createElement("div");
      feedbackPeg.classList.add("feedback-peg");
      feedback.appendChild(feedbackPeg);
    }
    row.appendChild(feedback);
    board.appendChild(row);
  }
}

function addColorChoiceListeners() {
  console.log("Adding color choice listeners");
  document.querySelectorAll(".color-choice").forEach((choice) => {
    choice.addEventListener("click", () => {
      if (gameOver) return;
      console.log("Color selected:", choice.dataset.color);
      document
        .querySelectorAll(".color-choice")
        .forEach((c) => c.classList.remove("selected"));
      choice.classList.add("selected");
      selectedColor = choice.dataset.color;
    });
  });
}

function addPegListeners(rowIndex) {
  console.log("Adding peg listeners for row:", rowIndex);
  const row = board.children[rowIndex];
  const pegs = row.querySelectorAll(".peg");
  pegs.forEach((peg) => {
    peg.addEventListener("click", () => {
      if (gameOver) return;
      if (selectedColor) {
        console.log("Placing color", selectedColor, "in peg");
        peg.style.backgroundColor = selectedColor;
        peg.dataset.color = selectedColor;
      } else {
        console.log("Clearing peg");
        peg.style.backgroundColor = "white";
        delete peg.dataset.color;
      }
      checkSubmitButton();
    });
  });
}

function checkSubmitButton() {
  console.log("Checking submit button state");
  if (gameOver) {
    checkGuess.disabled = true;
    return;
  }
  const row = board.children[currentRow];
  const pegs = row.querySelectorAll(".peg");
  const allFilled = Array.from(pegs).every((peg) => peg.dataset.color);
  checkGuess.disabled = !allFilled;
  console.log("Check button disabled:", !allFilled);
}

function displayFeedback(row, feedback) {
  console.log("Displaying feedback:", feedback);
  const feedbackDiv = row.querySelector(".feedback");
  const feedbackPegs = feedbackDiv.querySelectorAll(".feedback-peg");
  let index = 0;
  for (let i = 0; i < feedback.red; i++) {
    feedbackPegs[index].style.backgroundColor = "red";
    index++;
  }
  for (let i = 0; i < feedback.white; i++) {
    feedbackPegs[index].style.backgroundColor = "white";
    index++;
  }
  for (let i = 0; i < feedback.black; i++) {
    feedbackPegs[index].style.backgroundColor = "black";
    index++;
  }
}

checkGuess.addEventListener("click", () => {
  console.log("Check button clicked");
  if (gameOver) return;
  const row = board.children[currentRow];
  const pegs = row.querySelectorAll(".peg");
  const guess = Array.from(pegs).map((peg) => peg.dataset.color);
  console.log("Current guess:", guess);
  const feedback = getFeedback(guess, secretCode);
  displayFeedback(row, feedback);
  if (feedback.red === codeLength) {
    console.log("Player won!");
    message.textContent = "Congratulations! You cracked the code!";
    gameOver = true;
    restart.style.display = "block";
  } else if (currentRow + 1 === maxGuesses) {
    console.log("Player lost!");
    message.textContent = `Game Over! The code was: ${secretCode.join(", ")}`;
    gameOver = true;
    restart.style.display = "block";
  } else {
    console.log("Moving to next row:", currentRow + 1);
    currentRow++;
    addPegListeners(currentRow);
    selectedColor = null;
    document
      .querySelectorAll(".color-choice")
      .forEach((c) => c.classList.remove("selected"));
    checkSubmitButton();
  }
});

startGameButton.addEventListener("click", startGame);
restart.addEventListener("click", startGame);

console.log("Game initialized, starting first game");
startGame();
