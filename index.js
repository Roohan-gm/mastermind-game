const colors = ["red", "green", "blue", "yellow", "orange", "purple"];
const codeLength = 4;
const maxGuesses = 10;
let secretCode = [];
let currentRow = maxGuesses - 1;
let gameOver = true;
let selectedColor = null;
let allowDup = false;

const board = document.getElementById("board");
const checkGuess = document.getElementById("check-guess");
const newGame = document.getElementById("new-game");
const message = document.getElementById("message");
const duplicatesModal = document.getElementById("duplicates-modal");
const modalYes = document.getElementById("modal-yes");
const modalNo = document.getElementById("modal-no");

function showDuplicatesModal(callback) {
  duplicatesModal.style.display = "flex";
  modalYes.onclick = () => {
    duplicatesModal.style.display = "none";
    callback(true);
  };
  modalNo.onclick = () => {
    duplicatesModal.style.display = "none";
    callback(false);
  };
}

function initGame() {
  const urlParams = new URLSearchParams(window.location.search);
  allowDup = urlParams.get("duplicates") === "true";
  startGame();
}

function startGame() {
  secretCode = generateSecretCode(allowDup);
  currentRow = maxGuesses - 1;
  gameOver = false;
  message.textContent = "";
  checkGuess.disabled = true;
  board.innerHTML =
    '<div class="row code-display"><span class="code-label">Secret Code:</span></div>';
  createBoard();

  const codeDisplayRow = board.querySelector(".code-display");
  for (let i = 0; i < codeLength; i++) {
    const peg = document.createElement("div");
    peg.classList.add("peg", "code-peg");
    peg.textContent = "?";
    peg.style.backgroundColor = "transparent";
    peg.style.borderColor = "#34495e";
    peg.style.display = "flex";
    peg.style.alignItems = "center";
    peg.style.justifyContent = "center";
    peg.style.fontSize = "20px";
    codeDisplayRow.appendChild(peg);
  }

  newGame.addEventListener("click", () => {
    showDuplicatesModal((result) => {
      allowDup = result;
      startGame();
    });
  });
  checkGuess.addEventListener("click", checkGuessClick);
  addColorChoiceListeners();
  addPegListeners(currentRow);
}

function createBoard() {
  for (let i = maxGuesses - 1; i >= 0; i--) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.dataset.rowIndex = i;
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
    board.insertBefore(row, board.firstChild);
  }
}

function addColorChoiceListeners() {
  document.querySelectorAll(".color-choice").forEach((choice) => {
    choice.addEventListener("click", () => {
      if (gameOver) return;
      document
        .querySelectorAll(".color-choice")
        .forEach((c) => c.classList.remove("selected"));
      choice.classList.add("selected");
      selectedColor = choice.dataset.color;
    });
  });
}

function addPegListeners(rowIndex) {
  const row = Array.from(board.children).find(
    (row) => parseInt(row.dataset.rowIndex) === rowIndex
  );
  const pegs = row.querySelectorAll(".peg:not(.code-peg)");
  pegs.forEach((peg) => {
    peg.addEventListener("click", () => {
      if (gameOver || row.classList.contains("guessed")) return;
      if (selectedColor) {
        peg.style.backgroundColor = selectedColor;
        peg.dataset.color = selectedColor;
      } else {
        peg.style.backgroundColor = "white";
        delete peg.dataset.color;
      }
      checkSubmitButton();
    });
  });
}

function checkSubmitButton() {
  if (gameOver) {
    checkGuess.disabled = true;
    return;
  }
  const row = Array.from(board.children).find(
    (row) => parseInt(row.dataset.rowIndex) === currentRow
  );
  const pegs = row.querySelectorAll(".peg:not(.code-peg)");
  const allFilled = Array.from(pegs).every((peg) => peg.dataset.color);
  checkGuess.disabled = !allFilled;
}

function checkGuessClick() {
  if (gameOver) return;
  const row = Array.from(board.children).find(
    (row) => parseInt(row.dataset.rowIndex) === currentRow
  );
  row.classList.add("guessed");
  const pegs = row.querySelectorAll(".peg:not(.code-peg)");
  const guess = Array.from(pegs).map((peg) => peg.dataset.color);
  const feedback = getFeedback(guess, secretCode);
  displayFeedback(row, feedback);

  if (feedback.red === codeLength) {
    revealCode();
    message.textContent = "Congratulations! You cracked the code!";
    gameOver = true;
  } else if (currentRow === 0) {
    revealCode();
    message.textContent = `Game Over! The code was: ${secretCode.join(", ")}`;
    gameOver = true;
  } else {
    currentRow--;
    addPegListeners(currentRow);
    selectedColor = null;
    document
      .querySelectorAll(".color-choice")
      .forEach((c) => c.classList.remove("selected"));
    checkSubmitButton();
  }
}

function revealCode() {
  const codeDisplayRow = board.querySelector(".code-display");
  const codePegs = codeDisplayRow.querySelectorAll(".code-peg");
  codePegs.forEach((peg, index) => {
    peg.style.backgroundColor = secretCode[index];
    peg.textContent = "";
  });
}

function generateSecretCode(allowDuplicates) {
  const code = [];
  if (allowDuplicates) {
    for (let i = 0; i < codeLength; i++) {
      code.push(colors[Math.floor(Math.random() * colors.length)]);
    }
  } else {
    const shuffled = [...colors].sort(() => 0.5 - Math.random());
    for (let i = 0; i < codeLength; i++) {
      code.push(shuffled[i]);
    }
  }
  return code;
}

function getFeedback(guess, code) {
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
  return { red, white, black };
}

function displayFeedback(row, feedback) {
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

document.addEventListener("DOMContentLoaded", () => {
  initGame();
});
