let timerInterval;
let isRunning = false;
let isBreak = false;
let currentSessionIndex = null;
let time = 0;
let focusScore = null;

const timerElement = document.getElementById("timer");
const startStopButton = document.getElementById("startStopButton");
const resetButton = document.getElementById("resetButton");
const titleElement = document.getElementById("title");
const sessionSettings = document.getElementById("sessionSettings");
const scoreText = document.getElementById("scoreText");
const sessionsList = document.getElementById("sessions");
const sesionTitle = document.getElementById("sesionTitle");

let sessions = []; // 세션을 저장할 배열

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function updateTimer() {
  timerElement.textContent = formatTime(time);
  console.log(`현재 time : ${time}`);
}

function updateTitle() {
  titleElement.textContent = isBreak ? "휴식 시간" : "포모도로 타이머";
  sesionTitle.textContent = sessions[currentSessionIndex].sessionName
}

// 타이머 시작 함수 (분리하여 재사용 가능하게 함)
function startTimer() {
  if (time > 0) {
    isRunning = true;
    startStopButton.textContent = "일시정지";
    
    timerInterval = setInterval(() => {
      time--;
      updateTimer();
      
      if (time === 0) {
        clearInterval(timerInterval);
        handleTimerComplete();
      }
    }, 1000);
  }
}

// 타이머 완료 처리 함수
function handleTimerComplete() {
  isRunning = false;
  startStopButton.textContent = "시작";
  
  if (!isBreak) {
    // 집중 세션 종료 -> 휴식 세션 시작
    isBreak = true;
    time = sessions[currentSessionIndex].breakTime * 60;
    updateTitle();
    updateTimer();
    window.Electron.openCheckWindow(); // 점수 입력
    
    // 자동으로 휴식 타이머 시작
    startTimer();
  } else {
    // 휴식 세션 종료 -> 다음 집중 세션 시작
    isBreak = false;
    currentSessionIndex++;
    
    if (currentSessionIndex < sessions.length) {
      // 다음 세션으로 넘어가기
      time = sessions[currentSessionIndex].focusTime * 60;
      updateTitle();
      updateTimer();
      
      // 자동으로 다음 집중 세션 시작
      startTimer();
    } else {
      // 모든 세션이 끝난 후
      alert("모든 세션이 종료되었습니다!");
      currentSessionIndex = null;
    }
  }
}

function handleStartStop() {
  if (isRunning) {
    // 타이머 일시정지
    clearInterval(timerInterval);
    isRunning = false;
    startStopButton.textContent = "시작";
  } else {
    // 타이머 시작 또는 재개
    if (currentSessionIndex === null && sessions.length > 0) {
      // 첫 세션 시작
      currentSessionIndex = 0;
      time = sessions[currentSessionIndex].focusTime * 60;
      updateTitle();
      updateTimer();
    }
    
    startTimer();
  }
}

function handleReset() {
  clearInterval(timerInterval);
  isRunning = false;
  
  if (currentSessionIndex !== null) {
    time = isBreak ? 
      sessions[currentSessionIndex].breakTime * 60 : 
      sessions[currentSessionIndex].focusTime * 60;
  } else {
    time = 0;
  }
  
  updateTimer();
  updateTitle();
  startStopButton.textContent = "시작";
}

function addSession() {
  const sessionName = document.getElementById("sessionName").value || "세션 이름 없음";
  const focusTime = parseInt(document.getElementById("focusTime").value) || 25;
  const breakTime = parseInt(document.getElementById("breakTime").value) || 5;

  const session = {
    sessionName,
    focusTime,  // Focus time in minutes
    breakTime,  // Break time in minutes
  };

  sessions.push(session);

  // 세션 리스트 UI에 추가
  const sessionItem = document.createElement("li");
  sessionItem.textContent = `${session.sessionName} - 집중: ${focusTime}분, 휴식: ${breakTime}분`;
  sessionItem.addEventListener("click", () => {
    // 타이머 초기화
    clearInterval(timerInterval);
    isRunning = false;
    isBreak = false;
    
    // 선택된 세션으로 설정
    currentSessionIndex = sessions.indexOf(session);
    time = session.focusTime * 60;
    updateTitle();
    updateTimer();
    startStopButton.textContent = "시작";
    startStopButton.style.display = "inline-block"; // 버튼 보이기
  });

  sessionsList.appendChild(sessionItem);
}

document.getElementById("addSessionButton").addEventListener("click", addSession);
startStopButton.addEventListener("click", handleStartStop);
resetButton.addEventListener("click", handleReset);

updateTimer();