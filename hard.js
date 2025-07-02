const submitBtn = document.getElementById("submit-btn");
const soundBtn = document.getElementById("sound-btn");
const resultEl = document.getElementById("result-el");

let waitingForNext = false;

// Preload speech synthesis
function preloadSpeech() {
  const dummy = new SpeechSynthesisUtterance(" ");
  dummy.volume = 0;
  speechSynthesis.speak(dummy);
}
window.addEventListener("load", () => {
  preloadSpeech();
});

//Gets definition of the word
function getDefinition(word) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((res) => res.json())
    .then((data) => {
      const meaning = data[0]?.meanings?.[0];
      const definition = meaning?.definitions?.[0]?.definition;
      document.getElementById("definition").textContent =
        definition || "Couldn't get definition.";
    })
    .catch((err) => {
      console.error("Error fetching definition:", err);
      document.getElementById("definition").textContent =
        "Error loading definition.";
    });
}

// Gets a random word from the hard-words.json file
function getWord() {
  fetch("hard-words.json")
    .then((res) => res.json())
    .then((wordList) => {
      const index = Math.floor(Math.random() * wordList.length);
      currentWord = wordList[index];
      getDefinition(currentWord);
    });
}

// Function to speak the word
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  setTimeout(() => {
    speechSynthesis.speak(utterance);
  }, 100); // 100ms delay
}

// When sound button is clicked it speaks out the word
soundBtn.addEventListener("click", () => {
  speakWord(currentWord);
});

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "a" && soundBtn.disabled === false) {
    event.preventDefault();
    speakWord(currentWord);
  }
});

// Function to reset the game and shows the result
function resetGame() {
  if (!waitingForNext) {
    userAnswer = document
      .getElementById("text-input")
      .value.trim()
      .toLowerCase();

    if (userAnswer === currentWord) {
      resultEl.style.color = "green";
      resultEl.textContent = `✅ Correct! You spelled "${currentWord}" correctly!`;
    } else {
      resultEl.style.color = "red";
      resultEl.textContent = `❌ Incorrect. The correct spelling was "${currentWord}".`;
    }

    document.getElementById("text-input").disabled = true;
    submitBtn.textContent = "Next";
    waitingForNext = true;
  } else {
    // Reset game for next round
    document.getElementById("text-input").value = "";
    resultEl.textContent = "";
    submitBtn.textContent = "Submit";
    document.getElementById("text-input").disabled = false;
    waitingForNext = false;
    getWord();
  }
}

// Handle submit button click
submitBtn.addEventListener("click", () => {
  resetGame();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    resetGame();
  }
});

getWord();
