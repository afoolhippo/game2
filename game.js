const titleScreen = document.getElementById("titleScreen");
const playScreen = document.getElementById("playScreen");
const resultScreen = document.getElementById("resultScreen");

const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const pushButton = document.getElementById("pushButton");

const music = document.getElementById("music");
const scratchSound = document.getElementById("scratchSound");

const record = document.getElementById("record");
const cueText = document.getElementById("cueText");
const progressBar = document.getElementById("progressBar");
const grooveGauge = document.getElementById("grooveGauge");
const timeText = document.getElementById("timeText");
const resultScore = document.getElementById("resultScore");
const resultRank = document.getElementById("resultRank");
const notesContainer = document.getElementById("notesContainer");

// PUSHノーツのタイミング。1分弱の曲に合わせて調整してください。
const notes = [
  { time: 4 },
  { time: 7 },
  { time: 10 },
  { time: 13 },
  { time: 16 },
  { time: 20 },
  { time: 24 },
  { time: 28 },
  { time: 32 },
  { time: 36 },

];

const noteFallTime = 1.6; // 何秒前から落ち始めるか
const laneHeight = 170;
const judgeY = 122;

let score = 0;
let perfect = 0;
let good = 0;
let miss = 0;
let gameTimer = null;
let isPlaying = false;
let activeNotes = [];

scratchSound.volume = 0.35;

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
  activeNotes = [];

  notes.forEach(note => {
    note.hit = false;
    note.missed = false;
    note.element = null;
  });

  music.pause();
  music.currentTime = 0;

  record.className = "record";
  cueText.className = "cueText";
  cueText.textContent = "READY";
  progressBar.style.width = "0%";
  grooveGauge.style.width = "0%";
  timeText.textContent = "00:00";
  notesContainer.innerHTML = "";

  clearInterval(gameTimer);
}

function startGame() {
  resetGame();
  showScreen(playScreen);

  cueText.textContent = "GET READY";

  setTimeout(() => {
    cueText.textContent = "PLAY!";
    record.classList.add("playing");
    music.play();
    isPlaying = true;
    gameTimer = setInterval(updateGame, 1000 / 60);
  }, 900);
}

function updateGame() {
  if (!isPlaying) return;

  const current = music.currentTime;
  const duration = music.duration || 1;

  progressBar.style.width = `${(current / duration) * 100}%`;

  const minutes = Math.floor(current / 60);
  const seconds = Math.floor(current % 60).toString().padStart(2, "0");
  timeText.textContent = `${minutes}:${seconds}`;

  notes.forEach((note, index) => {
    if (note.hit || note.missed) return;

    const diff = note.time - current;

    if (diff <= noteFallTime && diff >= -0.45) {
      if (!note.element) {
        note.element = createNoteElement();
        notesContainer.appendChild(note.element);
        activeNotes.push(note);
      }

      const progress = 1 - diff / noteFallTime;
      const y = progress * judgeY;
      note.element.style.top = `${y}px`;
    }

    if (diff < -0.45) {
      note.missed = true;
      miss++;
      cueText.textContent = "MISS";
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
  el.textContent = "PUSH!";
  return el;
}

function push() {
  if (!isPlaying) return;

  const current = music.currentTime;

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
    cueText.textContent = "PERFECT!";
    cueText.className = "cueText good";
    playScratch();
    scratchRecord();
    markHit(target);
  } else if (bestDiff <= 0.34) {
    good++;
    score += 6;
    target.hit = true;
    cueText.textContent = "GOOD!";
    cueText.className = "cueText good";
    playScratch();
    scratchRecord();
    markHit(target);
  } else {
    cueText.textContent = "TOO EARLY";
    cueText.className = "cueText miss";
  }

  updateGauge();
}

function markHit(note) {
  if (note.element) {
    note.element.classList.add("hit");
    setTimeout(() => removeNote(note), 120);
  }
}

function removeNote(note) {
  if (note.element && note.element.parentNode) {
    note.element.parentNode.removeChild(note.element);
  }
  note.element = null;
}

function playScratch() {
  scratchSound.currentTime = 0;
  scratchSound.play().catch(() => {});
}

function scratchRecord() {
  record.classList.remove("playing");
  record.classList.add("scratch");

  setTimeout(() => {
    record.classList.remove("scratch");
    record.classList.add("playing");
  }, 210);
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
  let comment = "KEEP PRACTICING";

  if (rate >= 90) {
    rank = "S";
    comment = "LEGEND DJ!";
  } else if (rate >= 75) {
    rank = "A";
    comment = "NICE PUSH!";
  } else if (rate >= 55) {
    rank = "B";
    comment = "GOOD GROOVE";
  }

  resultScore.innerHTML = `
    PERFECT ${perfect}<br>
    GOOD ${good}<br>
    MISS ${miss}<br>
    GROOVE ${rate}%
  `;

  resultRank.textContent = `RANK ${rank} - ${comment}`;
  showScreen(resultScreen);
}

startButton.addEventListener("click", startGame);
retryButton.addEventListener("click", startGame);
pushButton.addEventListener("click", push);

pushButton.addEventListener("touchstart", e => {
  e.preventDefault();
  push();
});