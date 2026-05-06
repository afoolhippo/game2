const titleScreen = document.getElementById("titleScreen");
const playScreen = document.getElementById("playScreen");
const resultScreen = document.getElementById("resultScreen");

const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const homeButton = document.getElementById("homeButton");
const resultHomeButton = document.getElementById("resultHomeButton");
const pushButton = document.getElementById("pushButton");

const music = document.getElementById("music");
const sokkaSound = document.getElementById("sokkaSound");

const cueText = document.getElementById("cueText");
const grooveGauge = document.getElementById("grooveGauge");
const timeText = document.getElementById("timeText");
const resultScore = document.getElementById("resultScore");
const resultRank = document.getElementById("resultRank");
const notesContainer = document.getElementById("notesContainer");

const game = document.getElementById("game");

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

// 全体のタイミング補正。遅く聞こえる場合は 0.05〜0.10 に調整。
const noteOffset = 0.05;

let score = 0;
let perfect = 0;
let good = 0;
let miss = 0;
let gameTimer = null;
let isPlaying = false;

sokkaSound.volume = 0.9;

function showScreen(screen) {
  titleScreen.classList.remove("active");
  playScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");
}

function resetGame() {
  score = 0;
  perfect = 0;
  good = 0;
  miss = 0;
  isPlaying = false;

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

  clearInterval(gameTimer);
}

function goHome() {
  resetGame();
  showScreen(titleScreen);
}

function startGame() {
  resetGame();
  showScreen(playScreen);

  cueText.textContent = "みんなでそっか！";

  setTimeout(() => {
    cueText.textContent = "PLAY!";
    music.play();
    isPlaying = true;
    gameTimer = setInterval(updateGame, 1000 / 60);
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
  clearInterval(gameTimer);
  music.pause();

  const maxScore = notes.length * 10;
  const rate = Math.round((score / maxScore) * 100);

  let rank = "C";
  let comment = "そっか...";

  if (rate >= 90) {
    rank = "S";
    comment = "みんなでそっか！！";
  } else if (rate >= 75) {
    rank = "A";
    comment = "ナイスそっか！";
  } else if (rate >= 55) {
    rank = "B";
    comment = "GOOD そっか";
  }

  resultScore.innerHTML = `
    PERFECT ${perfect}<br>
    GOOD ${good}<br>
    MISS ${miss}<br>
    そっか率 ${rate}%
  `;

  resultRank.textContent = `RANK ${rank} - ${comment}`;

  showScreen(resultScreen);
}

startButton.addEventListener("click", startGame);
retryButton.addEventListener("click", startGame);
homeButton.addEventListener("click", goHome);
resultHomeButton.addEventListener("click", goHome);

pushButton.addEventListener("click", push);

pushButton.addEventListener("touchstart", e => {
  e.preventDefault();
  push();
});