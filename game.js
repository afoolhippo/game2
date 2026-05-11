const titleScreen =
  document.getElementById("titleScreen");

const playScreen =
  document.getElementById("playScreen");

const resultScreen =
  document.getElementById("resultScreen");

const startButton =
  document.getElementById("startButton");

const retryButton =
  document.getElementById("retryButton");

const backButton =
  document.getElementById("backButton");

const homeButton =
  document.getElementById("homeButton");

const shareButton =
  document.getElementById("shareButton");

const scratchButton =
  document.getElementById("scratchButton");

const music =
  document.getElementById("music");

const scratchSound =
  document.getElementById("scratchSound");

const goodSound =
  document.getElementById("goodSound");

const missSound =
  document.getElementById("missSound");

const record =
  document.getElementById("record");

const jacket =
  document.getElementById("jacket");

const cueText =
  document.getElementById("cueText");

const grooveGauge =
  document.getElementById("grooveGauge");

const timeText =
  document.getElementById("timeText");

const resultScore =
  document.getElementById("resultScore");

const resultImage =
  document.getElementById("resultImage");

const rankTitle =
  document.getElementById("rankTitle");

const notes = [
  4,7,10,13,16,20,
  24,28,32,36,40,
  44,48,52
];

let score = 0;
let perfect = 0;
let good = 0;
let miss = 0;

let currentNoteIndex = 0;

let gameTimer = null;

let isPlaying = false;

function showScreen(screen){

  titleScreen.classList.remove("active");
  playScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  screen.classList.add("active");
}

function resetGame(){

  score = 0;
  perfect = 0;
  good = 0;
  miss = 0;

  currentNoteIndex = 0;

  isPlaying = false;

  music.pause();
  music.currentTime = 0;

  record.className = "record";
  jacket.className = "jacket";

  cueText.className = "cueText";
  cueText.textContent = "INSERT VINYL";

  grooveGauge.style.width = "0%";

  clearInterval(gameTimer);
}

function startIntro(){

  resetGame();

  showScreen(playScreen);

  setTimeout(()=>{

    record.classList.add("slideOut");
    jacket.classList.add("hide");

    cueText.textContent =
      "NOW LOADING...";

  },500);

  setTimeout(()=>{

    cueText.textContent =
      "NOW SPINNING";

    record.classList.add("playing");

    startMusic();

  },1900);
}

function startMusic(){

  music.play();

  isPlaying = true;

  gameTimer =
    setInterval(updateGame,100);
}

function updateGame(){

  if(!isPlaying) return;

  const current =
    music.currentTime;

  const duration =
    music.duration || 1;

  const minutes =
    Math.floor(current / 60);

  const seconds =
    Math.floor(current % 60)
    .toString()
    .padStart(2,"0");

  const totalMinutes =
    Math.floor(duration / 60);

  const totalSeconds =
    Math.floor(duration % 60)
    .toString()
    .padStart(2,"0");

  timeText.textContent =
    `${minutes}:${seconds} / ${totalMinutes}:${totalSeconds}`;

  const nextNote =
    notes[currentNoteIndex];

  if(nextNote !== undefined){

    const diff =
      nextNote - current;

    if(diff <= 0.8 && diff > -0.6){

      cueText.textContent =
        "SCRATCH!";

      cueText.className =
        "cueText";
    }

    if(diff <= -0.6){

      miss++;

      currentNoteIndex++;

      cueText.textContent =
        "MISS...";

      cueText.className =
        "cueText miss";

      playSound(missSound);
    }
  }

  if(music.ended){

    finishGame();
  }
}

function scratch(){

  if(!isPlaying) return;

  playSound(scratchSound);

  record.classList.remove("playing");
  record.classList.add("scratch");

  setTimeout(()=>{

    record.classList.remove("scratch");
    record.classList.add("playing");

  },230);

  const current =
    music.currentTime;

  const target =
    notes[currentNoteIndex];

  if(target === undefined) return;

  const diff =
    Math.abs(current - target);

  if(diff <= 0.18){

    perfect++;

    score += 10;

    currentNoteIndex++;

    cueText.textContent =
      "PERFECT!";

    cueText.className =
      "cueText good";

    playSound(goodSound);

  } else if(diff <= 0.38){

    good++;

    score += 6;

    currentNoteIndex++;

    cueText.textContent =
      "GOOD!";

    cueText.className =
      "cueText good";

    playSound(goodSound);

  } else {

    miss++;

    score =
      Math.max(0, score - 2);

    cueText.textContent =
      "BAD...";

    cueText.className =
      "cueText miss";

    playSound(missSound);
  }

  updateGauge();
}

function updateGauge(){

  const maxScore =
    notes.length * 10;

  const percent =
    Math.min(
      100,
      (score / maxScore) * 100
    );

  grooveGauge.style.width =
    `${percent}%`;
}

function playSound(audio){

  audio.currentTime = 0;

  audio.play().catch(()=>{});
}

function finishGame(){

  isPlaying = false;

  clearInterval(gameTimer);

  music.pause();

  const maxScore =
    notes.length * 10;

  const rate =
    Math.round(
      (score / maxScore) * 100
    );

  let rank =
    "そっか見習い";

  let image =
    "result_bad.png";

  let shareText =
`まだまだ「そっか」修行中…🤔🎧

盛り上がり ${rate}%

無料ブラウザゲーム
「みんなでそっか！」
https://afoolhippo.github.io/game2/

#みんなでそっか #カバゲーセン`;

  if(rate >= 90){

    rank =
      "そっかマスター";

    image =
      "result_good.png";

    shareText =
`みんなでそっか！！！🔥🎧

盛り上がり ${rate}%

無料ブラウザゲーム
「みんなでそっか！」
https://afoolhippo.github.io/game2/

#みんなでそっか #カバゲーセン`;

  } else if(rate >= 60){

    rank =
      "そっか名人";

    image =
      "result_normal.png";

    shareText =
`いい感じに「そっか！」できた👍🎧

盛り上がり ${rate}%

無料ブラウザゲーム
「みんなでそっか！」
https://afoolhippo.github.io/game2/

#みんなでそっか #カバゲーセン`;
  }

  rankTitle.textContent =
    rank;

  resultImage.src =
    image;

  resultScore.innerHTML =
`
PERFECT ${perfect}<br>
GOOD ${good}<br>
MISS ${miss}<br><br>
盛り上がり ${rate}%
`;

  shareButton.onclick = ()=>{

    const url =
`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

    window.open(url,"_blank");
  };

  showScreen(resultScreen);
}

/* イベント */

startButton.addEventListener(
  "click",
  startIntro
);

retryButton.addEventListener(
  "click",
  ()=>{

    showScreen(titleScreen);
  }
);

backButton.addEventListener(
  "click",
  ()=>{

    resetGame();

    showScreen(titleScreen);
  }
);

homeButton.addEventListener(
  "click",
  ()=>{

    location.href =
      "https://afoolhippo.github.io/home/?skipTitle=1";
  }
);

scratchButton.addEventListener(
  "click",
  scratch
);

scratchButton.addEventListener(
  "touchstart",
  (e)=>{

    e.preventDefault();

    scratch();
  }
);