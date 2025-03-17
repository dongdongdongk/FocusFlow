let isRunning = false;
let time = 0;
let sessions = [];
let currentSessionIndex = null;

const timerElement = document.getElementById("timer");
const startStopButton = document.getElementById("startStopButton");
const resetButton = document.getElementById("resetButton");
const sessionNameInput = document.getElementById("sessionName");
const focusTimeInput = document.getElementById("focusTime");
const breakTimeInput = document.getElementById("breakTime");
const sessionsList = document.getElementById("sessions");
const sessionTitle = document.getElementById("sesionTitle");

window.Electron.onUpdateTimer((newTime) => {
  time = newTime;
  updateTimer();
});

window.Electron.onUpdateSessions((newSessions) => {
  sessions = newSessions;
  updateSessionsList();
});

window.Electron.onUpdateTitle((newTitle) => {
  sessionTitle.textContent = newTitle;
});

window.Electron.onAllSessionsCompleted(() => {
  alert('모든 세션이 완료되었습니다!');
  sessionTitle.textContent = "모든 세션 완료";
});


function updateTimer() {
  timerElement.textContent = formatTime(time);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}


function updateTimer() {
  timerElement.textContent = formatTime(time);
  console.log(`현재 time : ${time}`);
}

function startStop() {
  if (isRunning) {
    window.Electron.stopTimer();
    startStopButton.textContent = "시작";
  } else {
    startSession(currentSessionIndex)
    // window.Electron.startTimer();
    startStopButton.textContent = "일시정지";
  }
  isRunning = !isRunning;
}

function reset() {
  window.Electron.resetTimer();
  startStopButton.textContent = "시작";
  isRunning = false;
}


function addSession() {
  const sessionName = sessionNameInput.value || "세션 이름 없음";
  const focusTime = parseInt(focusTimeInput.value) || 25;
  const breakTime = parseInt(breakTimeInput.value) || 5;

  const session = {
    sessionName,
    focusTime, // Focus time in minutes
    breakTime, // Break time in minutes
  };

  window.Electron.addSession(session);

  sessionNameInput.value = "";
  focusTimeInput.value = "25";
  breakTimeInput.value = "5";
}

function deleteSession(index) {
  window.Electron.deleteSession(index);
}


function startSession(index) {
  window.Electron.startSession(index);
}

function updateSessionsList() {
  sessionsList.innerHTML = "";
  sessions.forEach((session, index) => {
    const sessionItem = document.createElement("li");
    sessionItem.textContent = `${session.sessionName} - 집중: ${session.focusTime}분, 휴식: ${session.breakTime}분`;
    
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => deleteSession(index));
    
    const startButton = document.createElement("button");
    startButton.textContent = "시작";
    startButton.addEventListener("click", () => startSession(index));
    
    sessionItem.appendChild(startButton);
    sessionItem.appendChild(deleteButton);
    sessionsList.appendChild(sessionItem);
  });
}

document.getElementById("addSessionButton").addEventListener("click", addSession);
startStopButton.addEventListener('click', startStop);
resetButton.addEventListener('click', reset);

// Initialize the timer display
updateTimer();