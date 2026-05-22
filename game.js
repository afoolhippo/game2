function setAppHeight() {
  const height = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

setAppHeight();

window.addEventListener("resize", setAppHeight);
window.addEventListener("orientationchange", setAppHeight);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setAppHeight);
  window.visualViewport.addEventListener("scroll", setAppHeight);
}

const titleScreen = document.getElementById("titleScreen");
const playScreen = document.getElementById("playScreen");
const resultScreen = document.getElementById("resultScreen");

const titleLogo = document.getElementById("titleLogo");

const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const homeButton = document.getElementById("homeButton");
const shareButton = document.getElementById("shareButton");
const registerButton = document.getElementById("registerButton");
const resultButtons = document.getElementById("resultButtons");
const arcadeButton = document.getElementById("arcadeButton");
const pushButton = document.getElementById("pushButton");

const music = document.getElementById("music");
const sokkaSound = document.getElementById("sokkaSound");

const cueText = document.getElementById("cueText");
const grooveGauge = document.getElementById("grooveGauge");
const timeText = document.getElementById("timeText");

const resultCharacter = document.getElementById("resultCharacter");
const resultTitle = document.getElementById("resultTitle");
const resultComment = document.getElementById("resultComment");
const resultScore = document.getElementById("resultScore");

const notesContainer = document.getElementById("notesContainer");
const game = document.getElementById("game");

const GAME_ID = "game2";
const GAME_TITLE = "みんなでそっか！";

const GAME_URL = "https://afoolhippo.github.io/game2/";
const ARCADE_URL = "https://afoolhippo.github.io/home/?skipTitle=1";

const SUPABASE_URL =
  "https://gmncxnybsovlallxgnkd.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_ly3h5OhL8HDSHhYdmJq_Fw_9pG3mhla";

const kabaDb = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const notes = [
  { time: 10.61 },
  { time: 12.42 },
  { time: 14.32 },
  { time: 16.12 },
  { time: 17.99 },
  { time: 19.85 },
  { time: 21.68 },
  { time: 23.48 },
  { time: 25.36 },
  { time: 27.20 },
  { time: 29.06 },
  { time: 30.90 },
  { time: 32.74 },
  { time: 34.57 },
  { time: 36.48 },
  { time: 38.26 },
  { time: 38.89 },
  { time: 39.52 },
  { time: 40.15 },
  { time: 42.45 },
  { time: 43.08 },
  { time: 43.71 },
  { time: 44.34 },
  { time: 46.16 },
  { time: 46.79 },
  { time: 47.42 },
  { time: 48.05 },
  { time: 49.90 },
  { time: 50.53 },
  { time: 51.16 },
  { time: 51.79 }
];

const noteFallTime = 1.6;
const judgeY = 134;
const noteOffset = 0.15;

let score = 0;
let perfect = 0;
let good = 0;
let miss = 0;
let lastRate = 0;
let lastTitle = "";
let scoreRegistered = false;

let gameTimer = null;
let isPlaying = false;
let isStarting = false;

sokkaSound.volume = 0.9;

function showScreen(screen) {
  titleScreen.classList.remove("active");
  playScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");

  setAppHeight();
}

function resetGame() {
  score = 0;
  perfect = 0;
  good = 0;
  miss = 0;
  lastRate = 0;
  lastTitle = "";
  scoreRegistered = false;

  isPlaying = false;
  isStarting = false;

  notes.forEach(note => {
    note.hit = false;
    note.missed = false;
    note.element = null;
  });

  music.pause();
  music.currentTime = 0;

  cueText.className = "cueText";
  cueText.textContent = "READY";

  grooveGauge.style.width = "0%";
  timeText.textContent = "0:00 / 0:00";

  notesContainer.innerHTML = "";

  resultButtons.classList.add("hidden");

  registerButton.disabled = false;
  registerButton.textContent = "記録を登録";

  clearInterval(gameTimer);

  setAppHeight();
}

function goTitle() {
  resetGame();
  showScreen(titleScreen);
}

function startGame() {
  if (isStarting || isPlaying) return;

  resetGame();
  isStarting = true;

  showScreen(playScreen);

  cueText.textContent = "みんなでそっか！";

  setTimeout(() => {
    cueText.textContent = "PLAY!";

    music.currentTime = 0;

    music.play().then(() => {
      isPlaying = true;
      isStarting = false;
      gameTimer = setInterval(updateGame, 1000 / 60);
    }).catch(() => {
      isPlaying = true;
      isStarting = false;
      gameTimer = setInterval(updateGame, 1000 / 60);
    });
  }, 900);
}

function updateGame() {
  if (!isPlaying) return;

  const current = music.currentTime + noteOffset;
  const rawCurrent = music.currentTime;
  const duration = music.duration || 1;

  const currentMin = Math.floor(rawCurrent / 60);
  const currentSec = Math.floor(rawCurrent % 60).toString().padStart(2, "0");

  const durationMin = Math.floor(duration / 60);
  const durationSec = Math.floor(duration % 60).toString().padStart(2, "0");

  timeText.textContent =
    `${currentMin}:${currentSec} / ${durationMin}:${durationSec}`;

  notes.forEach(note => {
    if (note.hit || note.missed) return;

    const diff = note.time - current;

    if (diff <= noteFallTime && diff >= -0.45) {
      if (!note.element) {
        note.element = createNoteElement();
        notesContainer.appendChild(note.element);
      }

      const progress = 1 - diff / noteFallTime;
      const y = progress * judgeY;
      note.element.style.top = `${y}px`;
    }

    if (diff < -0.45) {
      note.missed = true;
      miss++;

      cueText.textContent = "そっか...";
      cueText.className = "cueText miss";

      removeNote(note);
      updateGauge();
    }
  });

  if (music.ended) {
    finishGame();
  }
}

function createNoteElement() {
  const el = document.createElement("div");
  el.className = "note";
  return el;
}

function push() {
  if (!isPlaying) return;

  const current = music.currentTime + noteOffset;

  let target = null;
  let bestDiff = Infinity;

  notes.forEach(note => {
    if (note.hit || note.missed) return;

    const diff = Math.abs(current - note.time);

    if (diff < bestDiff) {
      bestDiff = diff;
      target = note;
    }
  });

  if (!target) return;

  if (bestDiff <= 0.16) {
    perfect++;
    score += 10;
    target.hit = true;

    cueText.textContent = "PERFECT そっか！";
    cueText.className = "cueText good";

    playSokka();
    markHit(target);
    shakeScreen();

  } else if (bestDiff <= 0.34) {
    good++;
    score += 6;
    target.hit = true;

    cueText.textContent = "GOOD そっか！";
    cueText.className = "cueText good";

    playSokka();
    markHit(target);

  } else {
    cueText.textContent = "TOO EARLY";
    cueText.className = "cueText miss";
  }

  updateGauge();
}

function showResultButtonsLater() {
  resultButtons.classList.add("hidden");

  setTimeout(() => {
    resultButtons.classList.remove("hidden");
  }, 1500);
}

function shakeScreen() {
  game.classList.add("screenShake");

  setTimeout(() => {
    game.classList.remove("screenShake");
  }, 120);
}

function playSokka() {
  sokkaSound.currentTime = 0;
  sokkaSound.play().catch(() => {});
}

function markHit(note) {
  if (note.element) {
    note.element.classList.add("hit");

    setTimeout(() => {
      removeNote(note);
    }, 120);
  }
}

function removeNote(note) {
  if (note.element && note.element.parentNode) {
    note.element.parentNode.removeChild(note.element);
  }

  note.element = null;
}

function updateGauge() {
  const maxScore = notes.length * 10;
  const percent = Math.min(100, (score / maxScore) * 100);
  grooveGauge.style.width = `${percent}%`;
}

function finishGame() {
  isPlaying = false;
  isStarting = false;
  clearInterval(gameTimer);
  music.pause();

  const maxScore = notes.length * 10;
  const rate = Math.round((score / maxScore) * 100);

  lastRate = rate;

  let title = "";
  let comment = "";
  let image = "";

  if (rate >= 90) {
    title = "そっかマスター";
    comment = "完璧な“そっか”だった！";
    image = "result_good.png";
  } else if (rate >= 60) {
    title = "ノリノリそっか";
    comment = "いい感じに“そっか”できた！";
    image = "result_normal.png";
  } else {
    title = "そっか修行中";
    comment = "まだまだ“そっか”できる！";
    image = "result_bad.png";
  }

  lastTitle = title;

  resultCharacter.src = image;
  resultTitle.textContent = title;
  resultComment.textContent = comment;

  resultScore.innerHTML = `
    PERFECT ${perfect}<br>
    GOOD ${good}<br>
    MISS ${miss}<br>
    そっか率 ${rate}%
  `;

  showScreen(resultScreen);
  showResultButtonsLater();
}

function shareResult() {
  const rate = lastRate || 0;

  let text = "";

  if (rate >= 90) {
    text =
`みんなでそっか！！🎧✨

そっか率 ${rate}%
PERFECT ${perfect}

無料ブラウザゲーム
「みんなでそっか！」

${GAME_URL}

#みんなでそっか
#カバゲーセン`;
  } else if (rate >= 60) {
    text =
`ノリノリそっか！🎵

そっか率 ${rate}%

無料ブラウザゲーム
「みんなでそっか！」

${GAME_URL}

#みんなでそっか
#カバゲーセン`;
  } else {
    text =
`そっか修行中…🥺

そっか率 ${rate}%

無料ブラウザゲーム
「みんなでそっか！」

${GAME_URL}

#みんなでそっか
#カバゲーセン`;
  }

  const shareUrl =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text);

  window.open(shareUrl, "_blank");
}

async function registerScore() {
  if (scoreRegistered) {
    alert("この記録は登録済みです");
    return;
  }

  const nickname = prompt(
    "ニックネームを入力してね",
    "匿名カバ"
  );

  if (!nickname) return;

  registerButton.disabled = true;
  registerButton.textContent = "登録中...";

  const { error } = await kabaDb
    .from("kaba_scores")
    .insert({
      game_id: GAME_ID,
      game_title: GAME_TITLE,
      nickname: nickname,
      rank_title: lastTitle,
      score: lastRate
    });

  if (error) {
    console.error(error);

    registerButton.disabled = false;
    registerButton.textContent = "記録を登録";

    alert("登録に失敗しました");
    return;
  }

  scoreRegistered = true;
  registerButton.textContent = "登録済み";

  alert("記録を登録しました！");
}

startButton.addEventListener("click", startGame);
titleLogo.addEventListener("click", startGame);

retryButton.addEventListener("click", goTitle);
homeButton.addEventListener("click", goTitle);

shareButton.addEventListener("click", shareResult);
registerButton.addEventListener("click", registerScore);

arcadeButton.addEventListener("click", () => {
  location.href = ARCADE_URL;
});

pushButton.addEventListener("click", push);

pushButton.addEventListener("touchstart", e => {
  e.preventDefault();
  push();
});