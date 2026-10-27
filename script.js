const games = {
  snack: {
    title: "Snack Time!", badge: "SPEAK & ASK", character: "🐰", name: "Bunny",
    rounds: [
      { prompt: "I'm hungry! What do you want to eat?", helper: "Try: “I want an apple!”", choices: ["🍎 Apple", "🍌 Banana", "🥕 Carrot"], targets: ["apple", "banana", "carrot"], sentence: v => `I want a ${v}!`, response: v => `Yummy! An ${v === "apple" ? "apple" : v === "orange" ? "orange" : v}! Let's have a snack!` },
      { prompt: "Would you like milk or water?", helper: "Try: “I want some water.”", choices: ["🥛 Milk", "💧 Water", "🧃 Juice"], targets: ["milk", "water", "juice"], sentence: v => "I want " + (v === "milk" ? "some milk." : v === "water" ? "some water." : "some juice."), response: v => `Good choice! ${v[0].toUpperCase()+v.slice(1)} sounds lovely!` },
      { prompt: "More snack, please! What shall we have?", helper: "Try: “Let's eat a banana!”", choices: ["🍓 A strawberry", "🍪 A cookie", "🍇 Grapes"], targets: ["strawberry", "cookie", "grapes"], sentence: v => `Let's eat ${v === "grapes" ? "some grapes" : "a " + v}.`, response: v => `Hooray! Let's share ${v}! Thank you, friend!` }
    ]
  },
  shop: {
    title: "The Toy Shop", badge: "CHOOSE & TELL", character: "🐻", name: "Bear",
    rounds: [
      { prompt: "I have two cars! Which one do you want?", helper: "Try: “I want the blue car!”", choices: ["🔵 Blue car", "🔴 Red car", "🟡 Yellow car"], targets: ["blue", "red", "yellow"], sentence: v => `I want the ${v} car.`, response: v => `The ${v} car! Vroom, vroom! Let's drive!` },
      { prompt: "What would you like to play with?", helper: "Try: “I want a teddy bear.”", choices: ["🧸 Teddy bear", "⚽ Ball", "🧱 Blocks"], targets: ["teddy", "bear", "ball", "blocks"], sentence: v => v === "blocks" ? "I want some blocks." : `I want a ${v === "teddy" ? "teddy bear" : v}.`, response: v => `Great choice! Let's play together!` },
      { prompt: "Oh! The toys are all mixed up. What do you want now?", helper: "Try: “Can I have the ball?”", choices: ["⚽ The ball", "🪁 The kite", "🚂 The train"], targets: ["ball", "kite", "train"], sentence: v => `Can I have ${v === "kite" ? "the kite" : "the " + v}?`, response: v => `Of course! Here you go. Let's play!` }
    ]
  },
  adventure: {
    title: "Fox's Adventure", badge: "LOOK & DESCRIBE", character: "🦊", name: "Fox",
    rounds: [
      { prompt: "Oh no! Where is my ball?", helper: "Look carefully. Try: “It's under the tree!”", choices: ["🌳 Under the tree", "🪑 On the chair", "🌼 By the flowers"], targets: ["tree", "chair", "flowers"], sentence: v => v === "tree" ? "It's under the tree!" : v === "chair" ? "It's on the chair!" : "It's by the flowers!", response: v => `You found it! My ball! Thank you for helping me!` },
      { prompt: "Look at that animal! What is it?", helper: "Try: “It's a little bird.”", choices: ["🐦 A bird", "🐸 A frog", "🐱 A cat"], targets: ["bird", "frog", "cat"], sentence: v => `It's a ${v === "frog" ? "frog" : v === "cat" ? "cat" : "bird"}.`, response: v => `Yes! A lovely ${v}! Hello, little friend!` },
      { prompt: "The sky is changing. What can you see?", helper: "Try: “I can see the sun!”", choices: ["☀️ The sun", "☁️ A cloud", "🌈 A rainbow"], targets: ["sun", "cloud", "rainbow"], sentence: v => `I can see ${v === "sun" ? "the sun" : v === "cloud" ? "a cloud" : "a rainbow"}!`, response: v => `Wow! What a beautiful day for an adventure!` }
    ]
  }
};

const $ = id => document.getElementById(id);
const modal = $("gameModal"), title = $("gameTitle"), character = $("character"), promptText = $("prompt");
const helper = $("helper"), choices = $("choices"), status = $("speechStatus"), feedback = $("feedback");
const micBtn = $("micBtn"), nextBtn = $("nextBtn"), hintBtn = $("hintBtn");
let currentGame = null, round = 0, selected = null, recognition = null, listening = false, soundOn = true;
const supported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
const clean = s => (s || "").toLowerCase().replace(/[.,!?']/g, " ").replace(/\s+/g, " ").trim();

function speak(text) {
  if (!soundOn || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.82;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}
function stopListening() {
  if (recognition && listening) { try { recognition.stop(); } catch (_) {} }
  listening = false;
  micBtn.classList.remove("listening");
  micBtn.querySelector("strong").textContent = "My turn to talk!";
}
function startListening() {
  if (!supported) {
    status.textContent = "Voice listening isn't available in this browser. Choose a picture and say the sentence together!";
    speak("You can choose a picture and say the sentence together.");
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;
  recognition.onstart = () => {
    listening = true; micBtn.classList.add("listening");
    micBtn.querySelector("strong").textContent = "I'm listening…";
    status.textContent = "I'm listening! Take your time.";
  };
  recognition.onresult = e => {
    const heard = Array.from(e.results[0]).map(r => r.transcript).join(" ");
    evaluateSpeech(heard);
  };
  recognition.onerror = e => {
    status.textContent = e.error === "not-allowed" ? "Microphone permission is off. You can still play with the pictures." : "I didn't catch that. Let's try together, or choose a picture.";
  };
  recognition.onend = () => stopListening();
  try { recognition.start(); } catch (_) { status.textContent = "Let's use the pictures to play this round."; }
}
function openGame(key) {
  currentGame = games[key]; round = 0;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  renderRound();
}
function closeGame() {
  stopListening();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  modal.classList.add("hidden"); document.body.style.overflow = "";
}
function renderRound() {
  stopListening(); selected = null;
  const data = currentGame.rounds[round];
  $("gameBadge").textContent = currentGame.badge;
  $("roundCount").textContent = `Round ${round + 1} of ${currentGame.rounds.length}`;
  title.textContent = currentGame.title; character.textContent = currentGame.character;
  promptText.textContent = data.prompt; helper.textContent = data.helper;
  choices.innerHTML = ""; feedback.classList.add("hidden"); nextBtn.classList.add("hidden");
  status.textContent = supported ? "Tap the microphone and tell me!" : "Choose a picture, then say the sentence together.";
  data.choices.forEach((choice, i) => {
    const b = document.createElement("button"); b.className = "choice-btn"; b.textContent = choice;
    b.addEventListener("click", () => choose(i, true)); choices.appendChild(b);
  });
  speak(`${currentGame.name} says: ${data.prompt}`);
}
function choose(i, announce) {
  selected = i;
  [...choices.children].forEach((b, n) => b.classList.toggle("selected", n === i));
  const data = currentGame.rounds[round];
  const label = data.choices[i].replace(/^[^\p{L}\p{N}]+/u, "").trim();
  const target = data.targets[i] || data.targets[0];
  const sentence = data.sentence(target);
  status.textContent = `Your picture: ${label}. Can you say, “${sentence}”`;
  if (announce) speak(`You chose ${label}. Can you say, ${sentence}`);
  feedback.classList.remove("hidden");
  feedback.textContent = `💛 Try saying: “${sentence}”`;
  nextBtn.classList.remove("hidden");
}
function evaluateSpeech(heard) {
  const data = currentGame.rounds[round];
  const spoken = clean(heard);
  const matchedIndex = data.choices.findIndex((_, i) => {
    const target = data.targets[i] || data.targets[0];
    return spoken.includes(clean(target)) || spoken.includes(clean(data.choices[i].replace(/^[^\p{L}\p{N}]+/u, "")));
  });
  if (matchedIndex >= 0) {
    selected = matchedIndex;
    [...choices.children].forEach((b, n) => b.classList.toggle("selected", n === selected));
    const target = data.targets[selected] || data.targets[0];
    const expected = clean(data.sentence(target));
    const phraseLike = spoken.split(" ").length >= 2;
    feedback.classList.remove("hidden");
    if (phraseLike || spoken.includes("i want") || spoken.includes("it's") || spoken.includes("can i") || spoken.includes("let's")) {
      feedback.textContent = `🌟 Lovely talking! ${currentGame.name} says: “${data.response(target)}”`;
      status.textContent = `I heard: “${heard}”`;
      speak(`Well done! ${data.response(target)}`);
      nextBtn.classList.remove("hidden");
    } else {
      feedback.textContent = `💛 I heard you! Can you tell me a little more? Try: “${data.sentence(target)}”`;
      status.textContent = `I heard: “${heard}”`;
      speak(`I heard you say ${target}. Can you say, ${data.sentence(target)}`);
      nextBtn.classList.remove("hidden");
    }
  } else {
    status.textContent = `I heard: “${heard}”. Let's try again or choose a picture.`;
    feedback.classList.remove("hidden");
    feedback.textContent = `You're doing great for trying! You can tap a picture, then try the little sentence.`;
    speak("Thank you for trying! Let's choose a picture and say it together.");
  }
}
function showHint() {
  const data = currentGame.rounds[round];
  const i = selected === null ? 0 : selected;
  const target = data.targets[i] || data.targets[0];
  const sentence = data.sentence(target);
  feedback.classList.remove("hidden");
  feedback.textContent = `💡 Listen first, then try: “${sentence}”`;
  status.textContent = "You can say it with me!";
  speak(`You can say, ${sentence}. ${sentence}`);
}
document.querySelectorAll("[data-game]").forEach(b => b.addEventListener("click", () => openGame(b.dataset.game)));
$("startBtn").addEventListener("click", () => $("games").scrollIntoView({behavior:"smooth"}));
$("closeModal").addEventListener("click", closeGame);
modal.addEventListener("click", e => { if (e.target === modal) closeGame(); });
micBtn.addEventListener("click", () => listening ? stopListening() : startListening());
hintBtn.addEventListener("click", showHint);
nextBtn.addEventListener("click", () => {
  if (round < currentGame.rounds.length - 1) { round++; renderRound(); }
  else {
    stopListening(); title.textContent = "You did it!"; character.textContent = "🎉";
    promptText.textContent = "You helped your friend and used your English!";
    helper.textContent = "Every little word helps you grow.";
    choices.innerHTML = ""; feedback.classList.remove("hidden");
    feedback.textContent = "🌟 Hooray! Let's play another adventure when you're ready.";
    status.textContent = "You were a brilliant helper!";
    nextBtn.textContent = "Choose another game"; nextBtn.classList.remove("hidden");
    nextBtn.onclick = () => { nextBtn.onclick = null; closeGame(); $("games").scrollIntoView({behavior:"smooth"}); };
    speak("Hooray! You were a brilliant helper. Let's play again soon!");
    return;
  }
  nextBtn.textContent = "Next adventure →";
});
$("soundToggle").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundToggle").setAttribute("aria-pressed", String(soundOn));
  $("soundToggle").innerHTML = soundOn ? '🔊 <span>Sound on</span>' : '🔇 <span>Sound off</span>';
  if (!soundOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeGame(); });
