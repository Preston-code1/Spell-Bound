const submitBtn = document.getElementById("submit-btn");
const soundBtn = document.getElementById("sound-btn");
const resultEl = document.getElementById("result-el");

let currentWord = "";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hasTriedToday() {
  return localStorage.getItem("tried-day") === getTodayKey();
}

function markTriedToday() {
  localStorage.setItem("tried-day", getTodayKey());
}

// Fetch and store a list of random words
function fetchAndStoreWordList() {
  return fetch("https://random-word-api.herokuapp.com/word?number=500")
    .then(res => res.json())
    .then(wordList => {
      const filtered = wordList.filter(w => w.length >= 4 && /^[a-z]+$/.test(w));
      localStorage.setItem("daily-word-list", JSON.stringify(filtered));
      return filtered;
    })
    .catch(err => {
      console.error("Failed to fetch word list:", err);
      return [];
    });
}

// Create a seeded index based on the date
function getSeededIndex(seed, length) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  return Math.abs(hash) % length;
}

// Function to speak the word
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// Try different words until one has a definition
async function tryNextWord() {
  let wordList = JSON.parse(localStorage.getItem("daily-word-list"));
  if (!wordList || wordList.length < 1) {
    wordList = await fetchAndStoreWordList();
  }

  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];
    const hasDefinition = await checkDefinition(word);
    if (hasDefinition) {
      currentWord = word.toLowerCase();
      displayDefinition(hasDefinition);
      break;
    }
  }
}

// Check if a word has a definition
async function checkDefinition(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    const meaning = data[0]?.meanings?.[0];
    const definition = meaning?.definitions?.[0]?.definition;
    return definition || null;
  } catch {
    return null;
  }
}

// Display the definition
function displayDefinition(def) {
  document.getElementById("definition").textContent = def;
}

// Start the daily game (gets seeded word, retries if needed)
async function startDailyGame() {
  const today = getTodayKey();

  let wordList = JSON.parse(localStorage.getItem("daily-word-list"));
  if (!wordList || wordList.length < 1) {
    wordList = await fetchAndStoreWordList();
  }

  const index = getSeededIndex(today, wordList.length);
  const word = wordList[index];
  const definition = await checkDefinition(word);

  if (definition) {
    currentWord = word.toLowerCase();
    displayDefinition(definition);

    if (hasTriedToday()) {
      document.getElementById("result-el").textContent = "🔒 You've already submitted your guess today!";
      document.getElementById("submit-btn").disabled = true;
      document.getElementById("text-input").disabled = true;
    }
  } else {
    console.log("⚠️ First word had no definition. Trying next...");
    await tryNextWord();
  }
}


// Event listeners
soundBtn.addEventListener("click", () => {
  speakWord(currentWord);
});

document.addEventListener('keydown', (event) => {
  if (event.altKey && event.key === 'a') {
    event.preventDefault();
    speakWord(currentWord);
  }
});

function showResult() {
  if (hasTriedToday()) return;

  const userAnswer = document.getElementById("text-input").value.trim().toLowerCase();
  markTriedToday();

  if (userAnswer === currentWord) {
    resultEl.style.color = "green";
    resultEl.textContent = `✅ Correct! You spelled "${currentWord}" correctly!`;
  } else {
    resultEl.style.color = "red";
    resultEl.textContent = `❌ Incorrect. The correct spelling was "${currentWord}".`;
  }

  // Disable further guesses
  document.getElementById("submit-btn").disabled = true;
  document.getElementById("text-input").disabled = true;
}


submitBtn.addEventListener("click", () => {
    showResult();
});

document.getElementById("text-input").addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        showResult();
    }
});

// Run it
startDailyGame();
