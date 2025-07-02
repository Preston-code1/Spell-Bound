const submitBtn = document.getElementById("submit-btn");
const soundBtn = document.getElementById("sound-btn");
const resultEl = document.getElementById("result-el");
const inputEl = document.getElementById("text-input");

let currentWord = "";
const todayKey = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

// Preload speech synthesis
function preloadSpeech() {
  const dummy = new SpeechSynthesisUtterance(" ");
  dummy.volume = 0;
  speechSynthesis.speak(dummy);
}
window.addEventListener("load", () => {
  preloadSpeech();
});

// Function to fetch the definition of the word
function getDefinition(word) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((res) => res.json())
    .then((data) => {
      const meaning = data[0]?.meanings?.[0];
      const definition = meaning?.definitions?.[0]?.definition;

      if (definition) {
        document.getElementById("definition").textContent = definition;
      } else {
        document.getElementById("definition").textContent =
          "Couldn't get definition.";
      }
    })
    .catch((err) => {
      console.error("Error fetching definition:", err);
    });
}

// Function to calculate the number of days since the start date
function getDayOffset(startDateStr) {
  const today = new Date().setHours(0, 0, 0, 0);
  const start = new Date(startDateStr).setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff;
}

//Gets the json file and loads the word for today
function loadDailyWord() {
  const startDate = "2025-06-29"; // Change to release date -- IMPORTANT

  fetch("daily-words.json")
    .then((res) => res.json())
    .then((wordList) => {
      const offset = getDayOffset(startDate);
      const index = offset % wordList.length;
      currentWord = wordList[index];
      getDefinition(currentWord);

      // Check if user already answered
      if (localStorage.getItem(`answered-${todayKey}`) === "true") {
        resultEl.textContent = `🔒 You already guessed today! The word was ${currentWord}.`;
        submitBtn.disabled = true;
        inputEl.disabled = true;
      }
    });
}

// Handle the submission of the answer
function handleSubmit() {
  if (localStorage.getItem(`answered-${todayKey}`) === "true") return;

  const userAnswer = inputEl.value.trim().toLowerCase();
  if (userAnswer === currentWord) {
    resultEl.style.color = "green";
    resultEl.textContent = `✅ Correct! You spelled "${currentWord}" correctly!`;
  } else {
    resultEl.style.color = "red";
    resultEl.textContent = `❌ Incorrect. The correct spelling was "${currentWord}".`;
  }

  // Save that user has submitted today
  localStorage.setItem(`answered-${todayKey}`, "true");

  // Lock inputs
  submitBtn.disabled = true;
  inputEl.disabled = true;
}

// Function to speak the word
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  setTimeout(() => {
    speechSynthesis.speak(utterance);
  }, 100); // 100ms delay for loading problems
}

// inputs to speak out the word   clicking and alt+a
soundBtn.addEventListener("click", () => {
  speakWord(currentWord);
});

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "a") {
    event.preventDefault();
    speakWord(currentWord);
  }
});

// Handle submit button click   enter key and clicking
submitBtn.addEventListener("click", handleSubmit);
inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSubmit();
  }
});

loadDailyWord();
