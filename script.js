const $ = id => document.getElementById(id);

const games = {
  talk: {
    title: "Let's Talk!", badge: "SPEAK & ANSWER", character: "🐰", name: "Bunny",
    rounds: [
      { prompt: "I'm hungry! What do you want to eat?", helper: "Try a little sentence: “I want an apple!”", choices: [
        {label:"🍎 Apple", target:"apple", sentence:"I want an apple.", response:"Yummy! An apple sounds lovely!"},
        {label:"🍌 Banana", target:"banana", sentence:"I want a banana.", response:"A banana! Let's have a snack!"},
        {label:"🥕 Carrot", target:"carrot", sentence:"I want a carrot.", response:"A crunchy carrot! Good choice!"}]},
      { prompt: "Which car would you like?", helper: "Try: “I want the blue car.”", choices: [
        {label:"🔵 Blue car", target:"blue car", sentence:"I want the blue car.", response:"Vroom, vroom! Let's drive!"},
        {label:"🔴 Red car", target:"red car", sentence:"I want the red car.", response:"The red car goes zoom!"},
        {label:"🟡 Yellow car", target:"yellow car", sentence:"I want the yellow car.", response:"What a sunny yellow car!"}]},
      { prompt: "Oh no! Where is Fox's ball?", helper: "Try: “It's under the tree!”", choices: [
        {label:"🌳 Under the tree", target:"tree", sentence:"It's under the tree.", response:"You found my ball! Thank you!"},
        {label:"🪑 On the chair", target:"chair", sentence:"It's on the chair.", response:"There it is! Great helping!"},
        {label:"🌼 By the flowers", target:"flowers", sentence:"It's by the flowers.", response:"You found it by the flowers!"}]}
    ]
  },
  animals: {
    title: "Animal World", badge: "COMPARE & DESCRIBE", character: "🦒", name: "Giraffe",
    rounds: [
      { prompt: "Look at the two animals. Which one is bigger?", helper: "Try: “The elephant is bigger.”", picture:"🐘　🐭", choices: [
        {label:"🐘 Elephant", target:"elephant", sentence:"The elephant is bigger.", response:"Yes! The elephant is bigger than the mouse!"},
        {label:"🐭 Mouse", target:"mouse", sentence:"The mouse is smaller.", response:"That's right! The mouse is smaller."}]},
      { prompt: "Who is taller?", helper: "Try: “The giraffe is taller.”", picture:"🦒　🐧", choices: [
        {label:"🦒 Giraffe", target:"giraffe", sentence:"The giraffe is taller.", response:"Yes! The giraffe is tall!"},
        {label:"🐧 Penguin", target:"penguin", sentence:"The penguin is shorter.", response:"Yes! The penguin is shorter than the giraffe."}]},
      { prompt: "Which animal is longer?", helper: "Try: “The crocodile is longer.”", picture:"🐊　🦔", choices: [
        {label:"🐊 Crocodile", target:"crocodile", sentence:"The crocodile is longer.", response:"Look at that long crocodile!"},
        {label:"🦔 Hedgehog", target:"hedgehog", sentence:"The hedgehog is shorter.", response:"Yes! The hedgehog is shorter."}]},
      { prompt: "Who is faster?", helper: "Try: “The cheetah is faster.”", picture:"🐆　🐢", choices: [
        {label:"🐆 Cheetah", target:"cheetah", sentence:"The cheetah is faster.", response:"Zoom! The cheetah is very fast!"},
        {label:"🐢 Turtle", target:"turtle", sentence:"The turtle is slower.", response:"Yes! The turtle is slower and takes its time."}]}
    ]
  },
  places: {
    title: "Where Is It?", badge: "LOOK & FIND", character: "🐻", name: "Bear",
    rounds: [
      { prompt: "Bear is hiding! Where is Bear?", helper: "Try: “Bear is under the table.”", picture:"🧸　🪑", choices: [
        {label:"⬇️ Under", target:"under", sentence:"Bear is under the table.", response:"You found me! I was under the table!"},
        {label:"⬆️ On", target:"on", sentence:"Bear is on the table.", response:"You found me on the table!"}]},
      { prompt: "Where is the kitten?", helper: "Try: “The kitten is in the box.”", picture:"🐱　📦", choices: [
        {label:"📦 In the box", target:"in the box", sentence:"The kitten is in the box.", response:"Meow! I love my cosy box!"},
        {label:"🪑 Next to the box", target:"next to", sentence:"The kitten is next to the box.", response:"Meow! I'm next to the box!"}]},
      { prompt: "Where is the bird?", helper: "Try: “The bird is behind the tree.”", picture:"🐦　🌳", choices: [
        {label:"🌳 Behind", target:"behind", sentence:"The bird is behind the tree.", response:"Tweet, tweet! You spotted me!"},
        {label:"🌳 In front", target:"in front", sentence:"The bird is in front of the tree.", response:"Tweet, tweet! I'm in front of the tree!"}]},
      { prompt: "The puppy wants to come out. Where is it?", helper: "Try: “The puppy is inside.”", picture:"🐶　🏠", choices: [
        {label:"🏠 Inside", target:"inside", sentence:"The puppy is inside.", response:"Woof! I'm safe and cosy inside!"},
        {label:"🌳 Outside", target:"outside", sentence:"The puppy is outside.", response:"Woof! I'm playing outside!"}]}
    ]
  }
};

const modal = $("gameModal"), title = $("gameTitle"), character = $("character");
const promptEl = $("prompt"), helperEl = $("helper"), picturePrompt = $("picturePrompt");
const choicesEl = $("choices"), statusEl = $("speechStatus"), feedbackEl = $("feedback");
const micBtn = $("micBtn"), hintBtn = $("hintBtn"), nextBtn = $("nextBtn");
let activeGame = null, roundIndex = 0, selectedIndex = null, recognition = null, listening = false, soundOn = true, finished = false;

const normalize = s => (s || "").toLowerCase().replace(/[.,!?']/g, " ").replace(/\s+/g, " ").trim();
function speak(text) {
  if (!soundOn || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB"; utterance.rate = 0.82; utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}
function speechRecognitionAvailable() { return "SpeechRecognition" in window || "webkitSpeechRecognition" in window; }
function stopListening() {
  if (recognition && listening) { try { recognition.stop(); } catch (_) {} }
  listening = false; micBtn.classList.remove("listening");
  micBtn.querySelector("strong").textContent = "My turn to talk!";
}
function startListening() {
  if (!speechRecognitionAvailable()) {
    statusEl.textContent = "Voice listening isn't available here. Choose a picture and say the sentence together.";
    speak("Let's choose a picture and say the sentence together."); return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-GB"; recognition.interimResults = false; recognition.maxAlternatives = 3; recognition.continuous = false;
  recognition.onstart = () => {
    listening = true; micBtn.classList.add("listening");
    micBtn.querySelector("strong").textContent = "I'm listening…";
    statusEl.textContent = "I'm listening. Take your time!";
  };
  recognition.onresult = event => {
    const alternatives = Array.from(event.results[0]).map(r => r.transcript);
    evaluateSpeech(alternatives);
  };
  recognition.onerror = event => {
    statusEl.textContent = event.error === "not-allowed" ? "Microphone permission is off. You can still play with the pictures." : "I didn't catch that. Let's try together or choose a picture.";
  };
  recognition.onend = () => { listening = false; micBtn.classList.remove("listening"); micBtn.querySelector("strong").textContent = "My turn to talk!"; };
  try { recognition.start(); } catch (_) { statusEl.textContent = "Let's use the pictures to play this round."; }
}
function openGame(key) {
  activeGame = games[key]; roundIndex = 0; finished = false;
  modal.classList.remove("hidden"); document.body.style.overflow = "hidden";
  renderRound();
}
function closeGame() {
  stopListening();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  modal.classList.add("hidden"); document.body.style.overflow = "";
}
function renderRound() {
  stopListening(); selectedIndex = null; finished = false;
  const round = activeGame.rounds[roundIndex];
  $("gameBadge").textContent = activeGame.badge;
  $("roundCount").textContent = `Activity ${roundIndex + 1} of ${activeGame.rounds.length}`;
  title.textContent = activeGame.title; character.textContent = activeGame.character;
  promptEl.textContent = round.prompt; helperEl.textContent = round.helper;
  if (round.picture) { picturePrompt.textContent = round.picture; picturePrompt.classList.remove("hidden"); }
  else { picturePrompt.textContent = ""; picturePrompt.classList.add("hidden"); }
  choicesEl.innerHTML = ""; feedbackEl.classList.add("hidden"); nextBtn.classList.add("hidden");
  nextBtn.textContent = "Next →"; statusEl.textContent = speechRecognitionAvailable() ? "Tap the microphone when you're ready." : "Choose a picture, then say the sentence together.";
  round.choices.forEach((choice, index) => {
    const button = document.createElement("button"); button.type = "button"; button.className = "choice-btn";
    button.textContent = choice.label;
    button.addEventListener("click", () => choose(index, true));
    choicesEl.appendChild(button);
  });
  speak(`${activeGame.name} says: ${round.prompt}`);
}
function choose(index, sayPrompt) {
  selectedIndex = index;
  [...choicesEl.children].forEach((button, i) => button.classList.toggle("selected", i === index));
  const choice = activeGame.rounds[roundIndex].choices[index];
  statusEl.textContent = `Can you say, “${choice.sentence}”`;
  feedbackEl.classList.remove("hidden");
  feedbackEl.textContent = `💛 Try saying: “${choice.sentence}”`;
  nextBtn.classList.remove("hidden");
  if (sayPrompt) speak(`You chose ${choice.target}. Can you say, ${choice.sentence}`);
}
function evaluateSpeech(transcripts) {
  const round = activeGame.rounds[roundIndex];
  const normalizedChoices = round.choices.map(c => normalize(c.target));
  let matchedIndex = -1, heard = transcripts[0] || "";
  for (const transcript of transcripts) {
    const words = normalize(transcript);
    const idx = normalizedChoices.findIndex(target => target && (words.includes(target) || target.split(" ").every(part => words.includes(part))));
    if (idx >= 0) { matchedIndex = idx; heard = transcript; break; }
  }
  statusEl.textContent = `I heard: “${heard}”`;
  if (matchedIndex < 0) {
    feedbackEl.classList.remove("hidden");
    feedbackEl.textContent = "💛 Thank you for trying! You can choose a picture and say the little sentence together.";
    speak("Thank you for trying! Let's choose a picture and say the sentence together.");
    return;
  }
  selectedIndex = matchedIndex;
  [...choicesEl.children].forEach((button, i) => button.classList.toggle("selected", i === matchedIndex));
  const choice = round.choices[matchedIndex];
  const isPhrase = normalize(heard).split(" ").length >= 2;
  feedbackEl.classList.remove("hidden");
  if (isPhrase) {
    feedbackEl.textContent = `🌟 Lovely talking! ${activeGame.name} says: “${choice.response}”`;
    speak(`Well done! ${choice.response}`);
  } else {
    feedbackEl.textContent = `💛 I heard you! Can you tell me a little more? Try: “${choice.sentence}”`;
    speak(`I heard you say ${choice.target}. Can you say, ${choice.sentence}`);
  }
  nextBtn.classList.remove("hidden");
}
function showHint() {
  const round = activeGame.rounds[roundIndex];
  const choice = round.choices[selectedIndex === null ? 0 : selectedIndex];
  feedbackEl.classList.remove("hidden");
  feedbackEl.textContent = `💡 Listen first, then try: “${choice.sentence}”`;
  statusEl.textContent = "You can say it with me!";
  speak(`You can say, ${choice.sentence}. ${choice.sentence}`);
}
function nextRound() {
  if (finished) { closeGame(); document.querySelector("#games").scrollIntoView({behavior:"smooth"}); return; }
  if (roundIndex < activeGame.rounds.length - 1) { roundIndex++; renderRound(); return; }
  finished = true; stopListening();
  title.textContent = "You did it!"; character.textContent = "🎉";
  promptEl.textContent = "You helped your animal friends and used your English!";
  helperEl.textContent = "Every little phrase helps you grow.";
  picturePrompt.classList.add("hidden"); choicesEl.innerHTML = "";
  feedbackEl.classList.remove("hidden"); feedbackEl.textContent = "🌟 Hooray! Let's play another game when you're ready.";
  statusEl.textContent = "You were a brilliant helper!"; nextBtn.textContent = "Choose another game"; nextBtn.classList.remove("hidden");
  speak("Hooray! You were a brilliant helper. Let's play again soon!");
}
document.querySelectorAll("[data-game]").forEach(button => button.addEventListener("click", () => openGame(button.dataset.game)));
$("closeModal").addEventListener("click", closeGame);
modal.addEventListener("click", event => { if (event.target === modal) closeGame(); });
micBtn.addEventListener("click", () => listening ? stopListening() : startListening());
hintBtn.addEventListener("click", showHint);
nextBtn.addEventListener("click", nextRound);
$("soundToggle").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundToggle").setAttribute("aria-pressed", String(soundOn));
  $("soundToggle").innerHTML = soundOn ? '🔊 <span>Sound on</span>' : '🔇 <span>Sound off</span>';
  if (!soundOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
});
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.classList.contains("hidden")) closeGame(); });
