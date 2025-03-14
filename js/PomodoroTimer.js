const POMODORO_TIME = 3; // 3 minutes for testing (convert to seconds)
const BREAK_TIME = 3; // 3 minutes for break time (convert to seconds)

let time = POMODORO_TIME;
let isRunning = false;
let isBreak = false;
let focusScore = null;
let timerInterval;

const timerElement = document.getElementById("timer");
const startStopButton = document.getElementById("startStopButton");
const resetButton = document.getElementById("resetButton");
const titleElement = document.getElementById("title");

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function updateTimer() {
  timerElement.textContent = formatTime(time);
}

function updateTitle() {
  titleElement.textContent = isBreak ? "휴식 시간" : "포모도로 타이머";
}

function handleStartStop() {
  if (isRunning) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(() => {
      time--;
      updateTimer();
      if (time === 0) {
        clearInterval(timerInterval);
        if (!isBreak) {
          isBreak = true;
          time = BREAK_TIME; // Switch to break time
          updateTitle(); // Update title to "휴식 시간"
          updateTimer(); // Update break time on UI
          startBreakTimer(); // Start break timer automatically
          window.Electron.openCheckWindow();
        } else {
          isBreak = false;
          time = POMODORO_TIME; // Switch back to focus time
          updateTitle(); // Update title to "포모도로 타이머"
          updateTimer(); // Update focus time on UI
          startFocusTimer(); // Start focus timer automatically
        }
        isRunning = false;
        startStopButton.textContent = "시작"; // Update button text to Start
      }
    }, 1000);
  }
  isRunning = !isRunning;
  startStopButton.textContent = isRunning ? "일시정지" : "시작";
}

function handleReset() {
  clearInterval(timerInterval);
  isRunning = false;
  time = POMODORO_TIME;
  updateTimer();
  updateTitle(); // Update title to "포모도로 타이머"
  startStopButton.textContent = "시작";
}

function startFocusTimer() {
  // Automatically start the focus timer countdown after the break time ends
  timerInterval = setInterval(() => {
    time--;
    updateTimer();
    if (time === 0) {
      clearInterval(timerInterval);
      isBreak = true;
      time = BREAK_TIME;
      updateTitle(); // Update title to "휴식 시간"
      updateTimer(); // Update break time on UI
      startBreakTimer(); // Start break timer automatically
      window.Electron.openCheckWindow();
    }
  }, 1000);
}

function startBreakTimer() {
  // Automatically start the break timer countdown once the focus time ends
  setTimeout(() => {
    clearInterval(timerInterval); // Clear any existing intervals
    timerInterval = setInterval(() => {
      time--;
      updateTimer();
      if (time === 0) {
        clearInterval(timerInterval);
        // After break time ends, reset for the next Pomodoro
        isBreak = false;
        time = POMODORO_TIME;
        updateTitle();
        updateTimer();
        startFocusTimer(); // Start focus time automatically after break
        startStopButton.textContent = "시작";
      }
    }, 1000);
  }, 1000); // Delay the start by 1 second after switching to break
}


startStopButton.addEventListener("click", handleStartStop);
resetButton.addEventListener("click", handleReset);

updateTimer();
updateTitle(); // Initialize title
