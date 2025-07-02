const submitBtn = document.getElementById("submit-btn");
const soundBtn = document.getElementById("sound-btn");
const resultEl = document.getElementById("result-el");

let currentWord = "";

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

//Gets a random word from the API
function getWord(word) {
  fetch("https://random-word-api.vercel.app/api?words=1")
    .then((res) => res.json())
    .then(([word]) => {
      currentWord = word.toLowerCase();
      getDefinition(currentWord);
    });
}

//function to speak the word
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  setTimeout(() => {
    speechSynthesis.speak(utterance);
  }, 100); // 100ms delay for loading problems
}

//function to fetch the definition of the word
function getDefinition(word) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((res) => res.json())
    .then((data) => {
      const meaning = data[0]?.meanings?.[0];
      const definition = meaning?.definitions?.[0]?.definition;

      if (definition) {
        document.getElementById("definition").textContent = definition;
        document.getElementById("sound-btn").disabled = false;
      } else {
        document.getElementById("definition").textContent = "Loading...";
        document.getElementById("sound-btn").disabled = true;
        getWord(); // Fetch a new word if definition is not available
      }
    })
    .catch((err) => {
      console.error("Error fetching definition:", err);
    });
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

// When submit button is clicked it shows the result
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
