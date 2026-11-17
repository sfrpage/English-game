const $ = id => document.getElementById(id);
const A = "assets/";
const modal = $("gameModal"), title = $("gameTitle"), stageImg = $("stageImg");
const promptEl = $("prompt"), helperEl = $("helper"), choicesEl = $("choices");
const statusEl = $("speechStatus"), feedbackEl = $("feedback"), micBtn = $("micBtn");
const hintBtn = $("hintBtn"), nextBtn = $("nextBtn"), replayBtn = $("replayBtn");
const bank = $("phraseBank"), progress = $("lessonProgress");
const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
let voice = null, soundOn = true, recognition = null, listening = false;
let game = "", phase = "", index = 0, selected = null, lastText = "", storyStep = 0;
const praise = ["Lovely talking!", "I love your idea!", "You helped so much!", "What a good thought!"];
const pick = a => a[Math.floor(Math.random()*a.length)];
function chooseVoice(){
 if(!synth)return;
 const vs=synth.getVoices().filter(v=>/^en/i.test(v.lang));
 voice=vs.find(v=>/natural|neural|Google UK English Female|Serena|Kate|Sonia|Martha|Hazel|Samantha/i.test(v.name))||vs[0]||null;
}
if(synth){chooseVoice();synth.onvoiceschanged=chooseVoice;}
function stopSpeaking(){if(synth)synth.cancel();}
function say(text){lastText=text;if(!soundOn||!synth||listening)return;stopSpeaking();const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";if(voice)u.voice=voice;u.rate=.78;u.pitch=1.05;synth.speak(u);}
function setStage(file){stageImg.src=A+file+".svg";}
function show(el){el.classList.remove("hidden");}
function hide(el){el.classList.add("hidden");}
function resetPanels(){choicesEl.innerHTML="";bank.innerHTML="";hide(bank);hide(progress);hide(feedbackEl);hide(nextBtn);show(replayBtn);show(micBtn);show(hintBtn);selected=null;}
function openGame(which){
 game=which;index=0;storyStep=0;modal.classList.remove("hidden");document.body.style.overflow="hidden";
 if(which==="story")renderStory();else{phase="learn";renderLesson();}
}
function closeGame(){stopMic();stopSpeaking();modal.classList.add("hidden");document.body.style.overflow="";}
function stopMic(){if(recognition&&listening){try{recognition.stop()}catch(e){}}listening=false;micBtn.classList.remove("listening");micBtn.querySelector("strong").textContent="My turn to talk!";}
function listen(){
 stopSpeaking();
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){statusEl.textContent="This browser can't use the microphone here. You can say it together without recording.";return;}
 recognition=new SR();recognition.lang="en-GB";recognition.interimResults=false;recognition.maxAlternatives=1;
 recognition.onstart=()=>{listening=true;micBtn.classList.add("listening");micBtn.querySelector("strong").textContent="I'm listening…";statusEl.textContent="I'm listening. Take your time!";};
 recognition.onresult=e=>{const words=e.results[0][0].transcript;stopMic();statusEl.textContent="I heard: “"+words+"”";onSpeech(words);};
 recognition.onerror=e=>{stopMic();statusEl.textContent=e.error==="not-allowed"?"The microphone is off. We can still play!":"That's okay. Let's try together.";};
 recognition.onend=()=>{if(listening)stopMic();};
 try{recognition.start()}catch(e){stopMic();statusEl.textContent="Let's try again when you're ready.";}
}
function onSpeech(words){
 if(game==="story"){show(feedbackEl);feedbackEl.textContent=pick(praise)+" "+words+"!";say("I love that idea! "+words);}
 else if(phase==="say"){show(feedbackEl);feedbackEl.textContent="You had a go! That's wonderful. You can say it again or move on.";say("Well done for having a go!");show(nextBtn);}
 else if(phase==="free"){show(feedbackEl);feedbackEl.textContent="You told me what you need. Lovely talking!";say("Lovely talking!");show(nextBtn);}
}
function base(badge,round,heading,prompt,helper,character){
 $("gameBadge").textContent=badge;$("roundCount").textContent=round;title.textContent=heading;
 promptEl.textContent=prompt;helperEl.textContent=helper;setStage(character||"bunny");resetPanels();
 statusEl.textContent="Listen, then have a go. There's no rush.";
}
function renderStory(){
 phase="story";const stories=[
 {name:"A walk in the woods",p:"Oh dear! Bunny can't find the way home. What should Bunny do?",h:"Tell Bunny your idea. You could say “Ask Teddy for help!” or think of your own idea.",s:"Bunny is lost in the woods. What should Bunny do?"},
 {name:"The rainy day",p:"It's raining and Teddy wants to play outside. What could Teddy do?",h:"Tell Teddy what you think. “Let's put on our boots!” is one idea.",s:"It's raining! What could Teddy do?"},
 {name:"A hungry friend",p:"Bunny's tummy is rumbling. What should we find for Bunny to eat?",h:"You can say “Let's find a carrot!” or tell us another idea.",s:"Bunny is hungry. What should we find?"},
 {name:"The missing teddy",p:"Teddy can't find his favourite little hat. Where should we look?",h:"Tell us where to look. “Look under the bed!” or your own idea.",s:"Where should we look for Teddy's hat?"}
 ];
 const st=stories[storyStep%stories.length];base("STORY TIME","Adventure "+(storyStep+1),st.name,st.p,st.h,storyStep%2?"bear":"bunny");
 statusEl.textContent="There isn't one right answer. Tell us what you think!";
 const starters=["Let's…","He can…","We should…"];
 starters.forEach(t=>{const b=document.createElement("button");b.className="choice-btn";b.textContent=t;b.onclick=()=>{statusEl.textContent="Can you finish that idea?";say(t);};choicesEl.appendChild(b);});
 show(nextBtn);nextBtn.textContent="Next adventure →";nextBtn.onclick=()=>{storyStep++;renderStory();};
 say(st.s);
}
const phrases=[
 {group:"Asking for a drink",scene:"Teddy is thirsty. His mouth feels dry.",say:"Can I have some water, please?",short:"Some water, please!",img:"bear"},
 {group:"Asking for a snack",scene:"Bunny is hungry and would like a cookie.",say:"Can I have a cookie, please?",short:"A cookie, please!",img:"bunny"},
 {group:"Asking for help",scene:"Teddy's toy is stuck. He can't reach it.",say:"Can you help me, please?",short:"Can you help me?",img:"bear"},
 {group:"Going to the toilet",scene:"Bunny needs to go to the toilet.",say:"Can I go to the toilet, please?",short:"Can I go to the toilet?",img:"bunny"},
 {group:"Asking to play",scene:"Teddy sees Bunny playing with blocks. He wants to join.",say:"Can I play with you?",short:"Can I play too?",img:"bear"},
 {group:"Taking a turn",scene:"Bunny and Teddy are playing with a ball. Bunny wants a turn.",say:"Can I have a turn, please?",short:"Can I have a turn?",img:"bunny"},
 {group:"Saying how you feel",scene:"Teddy feels tired after a busy day.",say:"I'm tired. I want to rest.",short:"I'm tired.",img:"bear"},
 {group:"Saying thank you",scene:"Bunny's friend gives her a lovely present.",say:"Thank you! I love it!",short:"Thank you!",img:"bunny"}
];
function renderLesson(){
 phase="learn";const p=phrases[index];base("EVERYDAY ENGLISH","Learn "+(index+1)+" of "+phrases.length,p.group,p.scene,"Listen to Teddy or Bunny. You can listen as many times as you like.",p.img);
 progress.textContent="Getting to know our phrases · "+(index+1)+" / "+phrases.length;show(progress);
 const card=document.createElement("div");card.className="teaching-phrase";card.textContent=p.say;choicesEl.appendChild(card);
 statusEl.textContent="Listen first. No need to repeat yet.";
 nextBtn.textContent=index===phrases.length-1?"I've learned them! →":"Next phrase →";show(nextBtn);
 nextBtn.onclick=()=>{if(index<phrases.length-1){index++;renderLesson();}else{phase="match";index=0;renderMatch();}};
 say(p.say);
}
const matches=[
 {scene:"Teddy is thirsty. He would like a drink.",answer:0},
 {scene:"Bunny is hungry. She would like a cookie.",answer:1},
 {scene:"Teddy can't reach his toy.",answer:2},
 {scene:"Bunny needs the toilet.",answer:3},
 {scene:"Teddy wants to join Bunny's game.",answer:4},
 {scene:"Bunny would like to play with the ball now.",answer:5},
 {scene:"Teddy is yawning and rubbing his eyes.",answer:6},
 {scene:"A friend gives Bunny a present.",answer:7}
];
function renderMatch(){
 phase="match";const m=matches[index];base("EVERYDAY ENGLISH","Match "+(index+1)+" of "+matches.length,"What could they say?",m.scene,"Choose the phrase that would help. You can tap it or drag it into the box.","bear");
 progress.textContent="Let's find the right words · "+(index+1)+" / "+matches.length;show(progress);
 const drop=document.createElement("div");drop.className="drop-zone";drop.textContent="Drop a phrase here";drop.ondragover=e=>e.preventDefault();drop.ondrop=e=>{e.preventDefault();choosePhrase(Number(e.dataTransfer.getData("text/plain")));};choicesEl.appendChild(drop);
 phrases.forEach((p,i)=>{const b=document.createElement("button");b.className="phrase-choice";b.textContent=p.say;b.draggable=true;b.ondragstart=e=>e.dataTransfer.setData("text/plain",String(i));b.onclick=()=>choosePhrase(i);bank.appendChild(b);});
 show(bank);hide(micBtn);hide(hintBtn);hide(replayBtn);statusEl.textContent="Take your time. You can listen to the choices with help."; 
}
function choosePhrase(i){
 if(phase!=="match")return;const m=matches[index];const drop=choicesEl.querySelector(".drop-zone");
 if(i===m.answer){drop.textContent=phrases[i].say;drop.classList.add("correct-drop");statusEl.textContent="That's a helpful thing to say!";feedbackEl.textContent="Lovely matching! Now let's try saying it.";show(feedbackEl);phase="say";hide(bank);show(micBtn);show(hintBtn);show(replayBtn);show(nextBtn);nextBtn.textContent="Next situation →";say(phrases[i].say);}
 else{statusEl.textContent="Let's think about what they need. Try another phrase.";drop.textContent="Try another phrase";say("What do they need?");}
}
function renderSay(){
 phase="say";const m=matches[index],p=phrases[m.answer];base("EVERYDAY ENGLISH","Say it "+(index+1)+" of "+matches.length,"Your turn to talk!",m.scene,"Can you say what Teddy or Bunny could ask? Have a go in your own time.",p.img);
 const model=document.createElement("div");model.className="teaching-phrase";model.textContent=p.say;choicesEl.appendChild(model);
 statusEl.textContent="You can listen first, then try saying it.";
 show(nextBtn);nextBtn.textContent=index===matches.length-1?"Try without the phrases →":"Next one →";
 nextBtn.onclick=()=>{if(index<matches.length-1){index++;renderSay();}else{phase="free";index=0;renderFree();}};
 say(p.say);
}
function renderFree(){
 phase="free";const m=matches[index];base("EVERYDAY ENGLISH","Your own words "+(index+1)+" of "+matches.length,"What would you say?",m.scene,"Try asking in your own words. You don't have to copy a sentence.",phrases[m.answer].img);
 statusEl.textContent="What would you say? Tap the microphone if you'd like.";
 show(nextBtn);nextBtn.textContent=index===matches.length-1?"Finish →":"Next moment →";
 nextBtn.onclick=()=>{if(index<matches.length-1){index++;renderFree();}else{base("WELL DONE!","","You did it!","You learned lots of useful English.","Every little attempt helps you grow. Let's play again soon.","bunny");statusEl.textContent="Lovely talking!";say("You did it! I'm so proud of your talking!");hide(micBtn);hide(hintBtn);hide(replayBtn);show(nextBtn);nextBtn.textContent="Choose another game";nextBtn.onclick=closeGame;}};
}
function showHint(){
 if(game==="story"){say("You can start with: I think… or Let's…");statusEl.textContent="You can use your own idea. There is no wrong answer.";return;}
 const p=phrases[matches[index]?.answer??index]||phrases[index];show(feedbackEl);feedbackEl.textContent="Here is one way to say it: “"+p.say+"”";say(p.say);
}
document.querySelectorAll("[data-game]").forEach(b=>b.addEventListener("click",()=>openGame(b.dataset.game)));
$("closeModal").addEventListener("click",closeGame);modal.addEventListener("click",e=>{if(e.target===modal)closeGame();});
micBtn.addEventListener("click",()=>listening?stopMic():listen());
hintBtn.addEventListener("click",showHint);
replayBtn.addEventListener("click",()=>{if(lastText)say(lastText);});
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundToggle").setAttribute("aria-pressed",String(soundOn));$("soundToggle").innerHTML=soundOn?'🔊 <span>Sound on</span>':'🔇 <span>Sound off</span>';if(!soundOn)stopSpeaking();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.classList.contains("hidden"))closeGame();});
