const $ = id => document.getElementById(id);
const A = "assets/";
const c = (label, target, sentence, response, ok = true, icon = null) => ({label, target, sentence, response, ok, icon});

const games = {
  talk: {
    title: "Let's Talk!", badge: "SPEAK & ANSWER", character: "bunny", name: "Bunny",
    rounds: [
      { name: "Snack Time", prompt: "What would you like to eat?", helper: "Can you ask for an apple? Say: “I want an apple.”", choices: [
        c("Apple", "apple", "I want an apple.", "Yummy! An apple sounds lovely!", true, "apple"),
        c("Banana", "banana", "I want a banana.", "A banana! Let's have a snack!", true, "banana"),
        c("Carrot", "carrot", "I want a carrot.", "A crunchy carrot! Good choice!", true, "carrot")]},
      { name: "Toy Shop", character: "bear", prompt: "What toy do you want?", helper: "Say: “I want the blue car.”", choices: [
        c("Blue car", "blue car", "I want the blue car.", "Vroom, vroom! Let's drive!", true, "car-blue"),
        c("Red car", "red car", "I want the red car.", "The red car goes zoom!", true, "car-red"),
        c("Yellow car", "yellow car", "I want the yellow car.", "What a sunny yellow car!", true, "car-yellow")]},
      { name: "Fox's Adventure", scene: "scene-fox", prompt: "Oh no! Where is Fox's ball? What happens next?", helper: "Say: “It's under the tree.”", choices: [
        c("Under the tree", "tree", "It's under the tree.", "You found the ball! Fox says thank you!", true, "icon-tree"),
        c("On the chair", "chair", "It's on the chair.", "There it is! Great helping!", true, "icon-chair"),
        c("By the flowers", "flowers", "It's by the flowers.", "You found it by the flowers!", true, "icon-flowers")]}
    ]
  },
  animals: {
    title: "Animal World", badge: "COMPARE & DESCRIBE", character: "giraffe", name: "Giraffe",
    rounds: [
      { name: "Big / Small", scene: "scene-big-small", prompt: "Which animal is bigger?", helper: "Say: “The elephant is bigger.” Is the mouse big or small?", choices: [
        c("Elephant", "elephant", "The elephant is bigger.", "Yes! The elephant is big. The mouse is small."),
        c("Mouse", "mouse", "The mouse is smaller.", "Let's look together! The elephant is big. The mouse is small.", false)]},
      { name: "Tall / Short", scene: "scene-tall-short", prompt: "Who is taller?", helper: "Say: “The giraffe is taller.” Tell me about the penguin.", choices: [
        c("Giraffe", "giraffe", "The giraffe is taller.", "Yes! The giraffe is tall. The penguin is short."),
        c("Penguin", "penguin", "The penguin is shorter.", "Let's look together! The giraffe is tall. The penguin is short.", false)]},
      { name: "Long / Short", scene: "scene-long-short", prompt: "Which one is longer?", helper: "Say: “The snake is longer.”", choices: [
        c("Snake", "snake", "The snake is longer.", "Yes! The snake is long. The worm is short."),
        c("Worm", "worm", "The worm is shorter.", "Let's look together! The snake is long. The worm is short.", false)]},
      { name: "Fast / Slow", scene: "scene-fast-slow", prompt: "Who is faster?", helper: "Say: “The cheetah is faster.”", choices: [
        c("Cheetah", "cheetah", "The cheetah is faster.", "Zoom! The cheetah is fast. The turtle is slow."),
        c("Turtle", "turtle", "The turtle is slower.", "Let's look together! The cheetah is fast. The turtle is slow.", false)]}
    ]
  },
  places: {
    title: "Where Is It?", badge: "LOOK & FIND", character: "bear", name: "Bear",
    rounds: [
      { name: "In", scene: "scene-in", prompt: "Where is the cat?", helper: "Say: “The cat is in the box.”", choices: [
        c("In", "in", "The cat is in the box.", "Yes! The cat is in the box."), c("On", "on", "The cat is on the box.", "Let's look again! The cat is in the box.", false)]},
      { name: "On", scene: "scene-on", prompt: "Where is the cat now?", helper: "Say: “The cat is on the box.”", choices: [
        c("On", "on", "The cat is on the box.", "Yes! The cat is on the box."), c("Under", "under", "The cat is under the box.", "Let's look again! The cat is on the box.", false)]},
      { name: "Under", scene: "scene-under", prompt: "Where is the cat?", helper: "Say: “The cat is under the table.”", choices: [
        c("Under", "under", "The cat is under the table.", "Yes! The cat is under the table."), c("In", "in", "The cat is in the table.", "Let's look again! The cat is under the table.", false)]},
      { name: "Beside", scene: "scene-beside", prompt: "Where is the cat?", helper: "Say: “The cat is beside the chair.”", choices: [
        c("Beside", "beside", "The cat is beside the chair.", "Yes! The cat is beside the chair."), c("Behind", "behind", "The cat is behind the chair.", "Let's look again! The cat is beside the chair.", false)]},
      { name: "Behind", scene: "scene-behind", prompt: "Where is the cat hiding?", helper: "Say: “The cat is behind the tree.”", choices: [
        c("Behind", "behind", "The cat is behind the tree.", "Yes! The cat is behind the tree."), c("Beside", "beside", "The cat is beside the tree.", "Let's look again! The cat is behind the tree.", false)]},
      { name: "Next to", scene: "scene-next-to", prompt: "Where is the ball?", helper: "Say: “The cat is next to the ball.”", choices: [
        c("Next to", "next to", "The cat is next to the ball.", "Yes! The cat is next to the ball."), c("Behind", "behind", "The cat is behind the ball.", "Let's look again! The cat is next to the ball.", false)]},
      { name: "Up", scene: "scene-up", prompt: "Where is the bird?", helper: "Say: “The bird is up in the tree.”", choices: [
        c("Up", "up", "The bird is up in the tree.", "Yes! The bird is up in the tree."), c("Down", "down", "The bird is down.", "Let's look again! The bird is up.", false)]},
      { name: "Down", scene: "scene-down", prompt: "Where is the ball?", helper: "Say: “The ball is down on the grass.”", choices: [
        c("Down", "down", "The ball is down on the grass.", "Yes! The ball is down on the grass."), c("Up", "up", "The ball is up.", "Let's look again! The ball is down.", false)]}
    ]
  }
};

const modal = $("gameModal"), title = $("gameTitle"), stageImg = $("stageImg");
const promptEl = $("prompt"), helperEl = $("helper");
const choicesEl = $("choices"), statusEl = $("speechStatus"), feedbackEl = $("feedback");
const micBtn = $("micBtn"), hintBtn = $("hintBtn"), nextBtn = $("nextBtn"), replayBtn = $("replayBtn");
let activeGame = null, roundIndex = 0, selectedIndex = null, recognition = null, listening = false, soundOn = true, finished = false;
let lastText = "", voice = null, speakToken = 0, speakTimer = null;
const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
const praise = ["Great talking!", "Well done!", "Good job!", "Lovely!"];
const pick = a => a[Math.floor(Math.random() * a.length)];
const normalize = s => (s || "").toLowerCase().replace(/[.,!?'’]/g, " ").replace(/\s+/g, " ").trim();

/* ---------- Voice: best available English voice, slow, never overlapping ---------- */
function chooseVoice() {
  if (!synth) return;
  const score = v => {
    let s = 0; const n = v.name;
    if (!/^en/i.test(v.lang)) return -99;
    if (/en[-_]GB/i.test(v.lang)) s += 4; else if (/en[-_](AU|IE|US)/i.test(v.lang)) s += 1;
    if (/natural|neural|online/i.test(n)) s += 6;
    if (/Google UK English Female|Serena|Kate|Stephanie|Libby|Sonia|Martha|Hazel|Samantha|Karen|Moira|Tessa|Fiona/i.test(n)) s += 4;
    if (/female/i.test(n)) s += 1;
    if (/compact|espeak|novelty|Albert|Bad News|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Junior|Organ|Trinoids|Whisper|Zarvox/i.test(n)) s -= 8;
    return s;
  };
  voice = synth.getVoices().filter(v => score(v) > -99).sort((a, b) => score(b) - score(a))[0] || null;
}
if (synth) { chooseVoice(); synth.onvoiceschanged = chooseVoice; }
function stopSpeaking() { speakToken++; clearTimeout(speakTimer); if (synth) synth.cancel(); }
/* Speaks one text or a list of texts, with a pause between each. */
function speak(parts, gap = 1100) {
  stopSpeaking();
  if (!soundOn || !synth || listening) return;
  const list = Array.isArray(parts) ? parts.slice() : [parts], token = speakToken;
  const next = () => {
    if (token !== speakToken || !list.length || listening) return;
    const u = new SpeechSynthesisUtterance(list.shift());
    u.lang = "en-GB"; if (voice) u.voice = voice; u.rate = 0.78; u.pitch = 1.06; u.volume = 1;
    const after = () => { if (token === speakToken) speakTimer = setTimeout(next, gap); };
    u.onend = after; u.onerror = after;
    synth.speak(u);
  };
  speakTimer = setTimeout(next, 250);
}
function say(text, replay) { lastText = replay || text; speak(text); }

/* ---------- Speech recognition: only starts when the mic is tapped ---------- */
function speechRecognitionAvailable() { return "SpeechRecognition" in window || "webkitSpeechRecognition" in window; }
function resetMic() { listening = false; micBtn.classList.remove("listening"); micBtn.querySelector("strong").textContent = "My turn to talk!"; }
function stopListening() {
  if (recognition && listening) { try { recognition.stop(); } catch (_) {} }
  resetMic();
}
function startListening() {
  stopSpeaking();
  if (!speechRecognitionAvailable()) {
    statusEl.textContent = "No microphone here. That's okay! Pick a picture and say it together.";
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-GB"; recognition.interimResults = false; recognition.maxAlternatives = 3; recognition.continuous = false;
  recognition.onstart = () => { listening = true; micBtn.classList.add("listening"); micBtn.querySelector("strong").textContent = "I'm listening…"; statusEl.textContent = "I'm listening. Take your time!"; };
  recognition.onresult = e => { const alts = Array.from(e.results[0]).map(r => r.transcript); resetMic(); evaluateSpeech(alts); };
  recognition.onerror = e => { resetMic(); statusEl.textContent = e.error === "not-allowed" ? "The microphone is off. You can still play with the pictures." : "That's okay! Let's try together or pick a picture."; };
  recognition.onend = resetMic;
  try { recognition.start(); } catch (_) { resetMic(); statusEl.textContent = "That's okay! Let's use the pictures."; }
}

/* ---------- Game flow ---------- */
function openGame(key) {
  activeGame = games[key]; roundIndex = 0; finished = false;
  modal.classList.remove("hidden"); document.body.style.overflow = "hidden";
  renderRound();
}
function closeGame() {
  stopListening(); stopSpeaking();
  modal.classList.add("hidden"); document.body.style.overflow = "";
}
function setStage(file, isCharacter) {
  stageImg.src = A + file + ".svg"; stageImg.classList.toggle("character", !!isCharacter);
}
function renderRound() {
  stopListening(); stopSpeaking(); selectedIndex = null; finished = false;
  const round = activeGame.rounds[roundIndex];
  $("gameBadge").textContent = activeGame.badge;
  $("roundCount").textContent = `Activity ${roundIndex + 1} of ${activeGame.rounds.length}`;
  title.textContent = round.name;
  round.scene ? setStage(round.scene, false) : setStage(round.character || activeGame.character, true);
  promptEl.textContent = round.prompt; helperEl.textContent = round.helper;
  choicesEl.innerHTML = ""; feedbackEl.classList.add("hidden"); nextBtn.classList.add("hidden");
  nextBtn.textContent = "Next →"; replayBtn.classList.remove("hidden"); micBtn.classList.remove("hidden"); hintBtn.classList.remove("hidden");
  statusEl.textContent = speechRecognitionAvailable() ? "Listen, then tap the microphone when you're ready." : "Look at the picture, then say it together.";
  round.choices.forEach((choice, index) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "choice-btn";
    if (choice.icon) { const im = document.createElement("img"); im.src = A + choice.icon + ".svg"; im.alt = ""; b.appendChild(im); }
    b.appendChild(document.createTextNode(choice.label));
    b.addEventListener("click", () => choose(index));
    choicesEl.appendChild(b);
  });
  say(round.prompt);   // asked once; then silence so she has time to answer
}
function choose(index) {
  selectedIndex = index;
  [...choicesEl.children].forEach((b, i) => b.classList.toggle("selected", i === index));
  const round = activeGame.rounds[roundIndex], choice = round.choices[index];
  const good = choice.ok ? choice : round.choices.find(x => x.ok);
  feedbackEl.classList.remove("hidden"); nextBtn.classList.remove("hidden");
  if (choice.ok) {
    feedbackEl.textContent = `💛 Can you say: “${choice.sentence}”`;
    statusEl.textContent = "Your turn! Take your time.";
    say(`Can you say: ${choice.sentence}`, choice.sentence);
  } else {
    feedbackEl.textContent = `💛 Let's look together! “${good.sentence}”`;
    statusEl.textContent = "Let's say it together!";
    say(`Let's look together. ${good.sentence}`, good.sentence);
  }
}
function evaluateSpeech(transcripts) {
  const round = activeGame.rounds[roundIndex];
  const hit = (words, target) => (` ${words} `).includes(` ${target} `) || target.split(" ").every(p => (` ${words} `).includes(` ${p} `));
  let idx = -1, heard = transcripts[0] || "";
  for (const t of transcripts) {
    const words = normalize(t), i = round.choices.findIndex(ch => hit(words, normalize(ch.target)));
    if (i >= 0) { idx = i; heard = t; break; }
  }
  statusEl.textContent = `I heard: “${heard}”`;
  feedbackEl.classList.remove("hidden"); nextBtn.classList.remove("hidden");
  const model = (idx >= 0 ? round.choices[idx] : round.choices.find(x => x.ok)).sentence;
  if (idx < 0) {
    feedbackEl.textContent = `💛 Thank you for trying! Let's try together: “${model}”`;
    say(`Thank you for trying. Let's try together. ${model}`, model); return;
  }
  selectedIndex = idx;
  [...choicesEl.children].forEach((b, i) => b.classList.toggle("selected", i === idx));
  const choice = round.choices[idx];
  if (normalize(heard).split(" ").length >= 3) {
    const p = pick(praise);
    feedbackEl.textContent = `🌟 ${p} ${choice.response}`;
    say([p, choice.response], choice.response);
  } else {
    feedbackEl.textContent = `💛 I heard you! Can you say a little more? “${choice.sentence}”`;
    say(`I heard you. Can you say: ${choice.sentence}`, choice.sentence);
  }
}
function showHint() {
  const round = activeGame.rounds[roundIndex];
  const choice = round.choices[selectedIndex === null ? 0 : selectedIndex];
  const good = choice.ok ? choice : round.choices.find(x => x.ok);
  feedbackEl.classList.remove("hidden"); nextBtn.classList.remove("hidden");
  feedbackEl.textContent = `💡 Let's say it together: “${good.sentence}”`;
  statusEl.textContent = "Listen first. Then you try!";
  say(good.sentence);
}
function nextRound() {
  if (finished) { closeGame(); document.querySelector("#games").scrollIntoView({behavior: "smooth"}); return; }
  if (roundIndex < activeGame.rounds.length - 1) { roundIndex++; renderRound(); return; }
  finished = true; stopListening();
  title.textContent = "You did it!"; setStage(activeGame.character, true);
  promptEl.textContent = "You used your English. Great talking!";
  helperEl.textContent = "Every little sentence helps you grow.";
  choicesEl.innerHTML = ""; micBtn.classList.add("hidden"); hintBtn.classList.add("hidden");
  feedbackEl.classList.remove("hidden"); feedbackEl.textContent = "🌟 Hooray! Let's play again soon.";
  statusEl.textContent = "You were a brilliant helper!"; nextBtn.textContent = "Choose another game"; nextBtn.classList.remove("hidden");
  say("Hooray! Great talking! You were a brilliant helper.");
}

document.querySelectorAll("[data-game]").forEach(b => b.addEventListener("click", () => openGame(b.dataset.game)));
$("closeModal").addEventListener("click", closeGame);
modal.addEventListener("click", e => { if (e.target === modal) closeGame(); });
micBtn.addEventListener("click", () => listening ? stopListening() : startListening());
hintBtn.addEventListener("click", showHint);
nextBtn.addEventListener("click", nextRound);
replayBtn.addEventListener("click", () => { stopListening(); const t = lastText || (activeGame && activeGame.rounds[roundIndex].prompt); if (t) speak(t); });
$("soundToggle").addEventListener("click", () => {
  soundOn = !soundOn;
  $("soundToggle").setAttribute("aria-pressed", String(soundOn));
  $("soundToggle").innerHTML = soundOn ? '🔊 <span>Sound on</span>' : '🔇 <span>Sound off</span>';
  if (!soundOn) stopSpeaking();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeGame(); });
