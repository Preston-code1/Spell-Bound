const submitBtn = document.getElementById("submit-btn");
const soundBtn = document.getElementById("sound-btn");
const resultEl = document.getElementById("result-el");

let waitingForNext = false;

function getDefinition(word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => res.json())
    .then(data => {
        const meaning = data[0]?.meanings?.[0];
        const definition = meaning?.definitions?.[0]?.definition;
        document.getElementById("definition").textContent = definition || "Couldn't get definition.";
    })
    .catch(err => {
        console.error("Error fetching definition:", err);
        document.getElementById("definition").textContent = "Error loading definition.";
    });
}

function getWord() {
    fetch('hard-words.json')
        .then(res => res.json())
        .then(wordList => {
            const index = Math.floor(Math.random() * wordList.length);
            currentWord = wordList[index];
            getDefinition(currentWord);
        });
}

function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

soundBtn.addEventListener("click", () => {
    speakWord(currentWord);
});

document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key === 'a' && soundBtn.disabled === false) {
        event.preventDefault();
        speakWord(currentWord);
    }
});

function resetGame() {
    if (!waitingForNext) {
      userAnswer = document.getElementById("text-input").value.trim().toLowerCase();

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

submitBtn.addEventListener("click", () => {
    resetGame();
});

document.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        resetGame();
    }
});

getWord();