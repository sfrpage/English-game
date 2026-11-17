const $ = id => document.getElementById(id);
const A = "assets/";
const modal = $("gameModal"), title = $("gameTitle"), stageImg = $("stageImg");
const promptEl = $("prompt"), helperEl = $("helper"), choicesEl = $("choices");
const statusEl = $("speechStatus"), feedbackEl = $("feedback"), micBtn = $("micBtn");
const hintBtn = $("hintBtn"), nextBtn = $("nextBtn"), replayBtn = $("replayBtn");
const bank = $("phraseBank"), progress = $("lessonProgress");
const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
let voice = null, soundOn = true, recognition = null, listening = false;
let game = "", phase = "", index = 0, selected = null, lastText = "", storyStep = 0, conversationTurn = 0;
const praise = ["Lovely talking!", "I love your idea!", "You helped so much!", "What a good thought!"];
const pick = a => a[Math.floor(Math.random()*a.length)];
function chooseVoice(){
 if(!synth)return;
 const vs=synth.getVoices().filter(v=>/^en/i.test(v.lang));
 const select=$("voiceSelect");
 const previous=select?.value||"auto";
 if(select){
   select.innerHTML='<option value="auto">Best available English voice</option>';
   vs.forEach((v,i)=>{const o=document.createElement("option");o.value=String(i);o.textContent=v.name+" ("+v.lang+")";select.appendChild(o);});
   if(previous!=="auto"&&Number(previous)<vs.length)select.value=previous;
 }
 const natural=vs.find(v=>/online.*natural|natural.*online|neural|google.*english|samantha|aria|jenny|sonia/i.test(v.name));
 voice=select&&select.value!=="auto"?vs[Number(select.value)]:(natural||vs[0]||null);
}
if(synth){chooseVoice();synth.onvoiceschanged=chooseVoice;}
$("voiceSelect")?.addEventListener("change",()=>{chooseVoice();say("Hello! Let's play together.");});
function stopSpeaking(){if(synth)synth.cancel();}
function say(text){lastText=text;if(!soundOn||!synth||listening)return;stopSpeaking();const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";if(voice)u.voice=voice;u.rate=.88;u.pitch=1.08;synth.speak(u);}
function setStage(file){stageImg.src=A+file+".svg";const stage=$("characterStage");if(stage)stage.dataset.scene=game||"story";}
function show(el){el.classList.remove("hidden");}
function hide(el){el.classList.add("hidden");}
function resetPanels(){choicesEl.innerHTML="";bank.innerHTML="";hide(bank);hide(progress);hide(feedbackEl);hide(nextBtn);show(replayBtn);show(micBtn);show(hintBtn);selected=null;}
function openGame(which){
 game=which;index=0;storyStep=0;modal.classList.remove("hidden");document.body.style.overflow="hidden";
 if(which==="story")renderStory();else if(which==="everyday"){phase="learn";renderLesson();}else{conversationTurn=0;renderConversation();}
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
 if(game==="conversation"){conversationSpeech(words);return;}
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
 if(i===m.answer){drop.textContent=phrases[i].say;drop.classList.add("correct-drop");statusEl.textContent="That's a helpful thing to say!";feedbackEl.textContent="Lovely matching! Now let's try saying it.";show(feedbackEl);phase="say";hide(bank);show(micBtn);show(hintBtn);show(replayBtn);show(nextBtn);nextBtn.textContent="Next situation →";nextBtn.onclick=()=>{if(index<matches.length-1){index++;renderMatch();}else{index=0;renderFree();}};say(phrases[i].say);}
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

const conversations=[
 {scene:"Teddy is building a very tall block tower. He looks excited!",prompt:"Teddy is making something. What could you say to start talking to him?",starters:["What are you making?","Can I help you?","Wow, that's tall!"],reply:"I'm building a tall tower! Do you want to help me?",follow:["Yes, please!","Let's build together!","Can I have a block?"]},
 {scene:"Bunny has a colourful new kite. It's flying in the sky!",prompt:"Bunny has something new. What could you say to her?",starters:["What's that?","Can I see?","Your kite is pretty!"],reply:"It's my new kite! Do you like it?",follow:["Yes, I love it!","Can I fly it?","It's so beautiful!"]},
 {scene:"Teddy dropped his toy and looks a little sad.",prompt:"Teddy looks sad. What could you say to him?",starters:["Are you okay?","What's wrong?","Do you need help?"],reply:"My toy fell down. Can you help me?",follow:["Of course!","Here you are!","Let's pick it up!"]},
 {scene:"Bunny is drawing a picture with lots of colours.",prompt:"Bunny is drawing. How could you start a chat?",starters:["What are you drawing?","Can I draw too?","I like your picture!"],reply:"I'm drawing a rainbow! What is your favourite colour?",follow:["I like pink!","I like blue!","I love all colours!"]},
 {scene:"Teddy and Bunny are playing with a big red ball.",prompt:"They are playing a game. What could you say to join in?",starters:["Can I play too?","What are you playing?","Let's play together!"],reply:"We're playing catch! Would you like a turn?",follow:["Yes, please!","Throw it to me!","It's my turn!"]}
];
function renderConversation(){
 phase="conversation";const c=conversations[index%conversations.length];conversationTurn=0;
 base("SPEAK & PLAY","Chat "+(index+1)+" of "+conversations.length,"Start the conversation!",c.scene,c.prompt,"bunny");
 $("characterStage").dataset.scene="conversation";
 progress.textContent="Look, think, and start talking · "+(index+1)+" / "+conversations.length;show(progress);
 const scene=document.createElement("div");scene.className="conversation-scene-note";scene.textContent="💭 What would you say first?";choicesEl.appendChild(scene);
 c.starters.forEach(t=>{const b=document.createElement("button");b.className="choice-btn conversation-starter";b.textContent=t;b.onclick=()=>{say(t);conversationTurn=1;showConversationReply();};choicesEl.appendChild(b);});
 statusEl.textContent="You can think of your own words, or tap an idea to hear it.";
 show(nextBtn);nextBtn.textContent="I had a turn! →";nextBtn.onclick=()=>{if(conversationTurn===0){statusEl.textContent="Try saying hello or asking a question first. You can tap one of the ideas.";return;}nextConversation();};
}
function showConversationReply(){
 const c=conversations[index%conversations.length];hide(nextBtn);choicesEl.innerHTML="";
 const reply=document.createElement("div");reply.className="character-reply";reply.innerHTML="<strong>Teddy / Bunny says:</strong><span>"+c.reply+"</span>";choicesEl.appendChild(reply);
 const question=document.createElement("p");question.className="conversation-followup";question.textContent="What could you say back?";choicesEl.appendChild(question);
 c.follow.forEach(t=>{const b=document.createElement("button");b.className="choice-btn conversation-starter";b.textContent=t;b.onclick=()=>{say(t);statusEl.textContent="Lovely! You kept the conversation going.";show(feedbackEl);feedbackEl.textContent="You started a chat and took another turn. That's real talking!";show(nextBtn);nextBtn.textContent="Next chat →";nextBtn.onclick=nextConversation;};choicesEl.appendChild(b);});
 conversationTurn=1;statusEl.textContent="Teddy or Bunny answered! Can you say something back?";
 say(c.reply);
}
function conversationSpeech(words){
 if(conversationTurn===0){show(feedbackEl);feedbackEl.textContent="You started the chat! "+words;showConversationReply();}
 else{show(feedbackEl);feedbackEl.textContent="You kept the chat going! "+words;statusEl.textContent="Wonderful chatting. Ready for another friend?";show(nextBtn);nextBtn.textContent="Next chat →";nextBtn.onclick=nextConversation;}
}
function nextConversation(){
 if(index<conversations.length-1){index++;renderConversation();}
 else{base("CHAT COMPLETE","","You started five little chats!","You said hello, asked questions and kept conversations going.","That's exactly how little conversations grow. Let's play again!","bunny");$("characterStage").dataset.scene="conversation";statusEl.textContent="You did it!";hide(micBtn);hide(hintBtn);hide(replayBtn);show(nextBtn);nextBtn.textContent="Play again";nextBtn.onclick=()=>{index=0;renderConversation();};}
}

function showHint(){
 if(game==="story"){say("You can start with: I think… or Let's…");statusEl.textContent="You can use your own idea. There is no wrong answer.";return;}
 if(game==="conversation"){const c=conversations[index%conversations.length];say(conversationTurn===0?c.starters[0]:c.follow[0]);statusEl.textContent="Try one of these ideas, or think of your own words.";return;}
 const p=phrases[matches[index]?.answer??index]||phrases[index];show(feedbackEl);feedbackEl.textContent="Here is one way to say it: “"+p.say+"”";say(p.say);
}
document.querySelectorAll("[data-game]").forEach(b=>b.addEventListener("click",()=>openGame(b.dataset.game)));
$("closeModal").addEventListener("click",closeGame);modal.addEventListener("click",e=>{if(e.target===modal)closeGame();});
micBtn.addEventListener("click",()=>listening?stopMic():listen());
hintBtn.addEventListener("click",showHint);
replayBtn.addEventListener("click",()=>{if(lastText)say(lastText);});
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundToggle").setAttribute("aria-pressed",String(soundOn));$("soundToggle").innerHTML=soundOn?'🔊 <span>Sound on</span>':'🔇 <span>Sound off</span>';if(!soundOn)stopSpeaking();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.classList.contains("hidden"))closeGame();});
