let timerInterval;
let isRunning = false;
let isBreak = false;
let currentSessionIndex = null;
let time = 0;
let focusScore = null;
let fiveMinAlert, oneMinAlert; // 타이머 ID를 저장할 변수 추가

const timerElement = document.getElementById("timer");
const startStopButton = document.getElementById("startStopButton");
const resetButton = document.getElementById("resetButton");
const titleElement = document.getElementById("title");
const sessionSettings = document.getElementById("sessionSettings");
const scoreText = document.getElementById("scoreText");
const sessionsList = document.getElementById("sessions");
const sesionTitle = document.getElementById("sesionTitle");

let sessions = []; // 세션을 저장할 배열

function playAlert(type) {
  console.log(`🔔 playAlert 호출됨! type:`, type); // ✅ 로그 추가

  if (!type) {
    console.error("❌ playAlert 함수에 type이 전달되지 않았습니다.");
    return;
  }

  window.Electron.playAlertSound(type);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function updateTimer() {
  timerElement.textContent = formatTime(time);
  // console.log(`현재 time : ${time}`);
}

function updateTitle() {
  titleElement.textContent = isBreak ? "휴식 시간" : "포모도로 타이머";
  sesionTitle.textContent = sessions[currentSessionIndex].sessionName;
}

function notifyUser(option) {
  new Notification(option.title, option);
}

// 타이머 시작 함수 (분리하여 재사용 가능하게 함)
function startTimer() {
  if (time > 0) {
    isRunning = true;
    startStopButton.textContent = "일시정지";

    clearTimeout(fiveMinAlert);
    clearTimeout(oneMinAlert);

    // ✅ 5분 전 알람 (휴식 & 집중 구분)
    if (time > 5 * 60) {
      fiveMinAlert = setTimeout(() => {
        notifyUser({
          title: "알림",
          body: `${titleElement.textContent} 종료 5분 전입니다!`,
        });

        const alertType = isBreak ? "break_5min" : "focus_5min"; // ✅ type을 정확히 정의
        playAlert(alertType);
      }, (time - 5 * 60) * 1000);
    }

    // ✅ 1분 전 알람 (휴식 & 집중 구분)
    if (time > 1 * 60) {
      oneMinAlert = setTimeout(() => {
        notifyUser({
          title: "알림",
          body: `${titleElement.textContent} 종료 1분 전입니다!`,
        });

        const alertType = isBreak ? "break_1min" : "focus_1min"; // ✅ type을 정확히 정의
        playAlert(alertType);
      }, (time - 1 * 60) * 1000);
    }

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
    // 마지막 세션인지 확인
    const isLastSession = currentSessionIndex === sessions.length - 1;
    
    if (isLastSession) {
      // 마지막 세션이면 모든 세션 완료로 처리
      const alertType = "all_sessions_completed";
      playAlert(alertType);
      notifyUser({
        title: "알림",
        body: '모든 세션이 종료되었습니다!'
      });
      currentSessionIndex = null;
      startStopButton.textContent = "시작";
      window.Electron.openCheckWindow();
    } else {
      // 마지막 세션이 아니면 휴식 시간 시작
      const alertType = "break_start";
      playAlert(alertType);
      notifyUser({
        title: "알림",
        body: '센션이 종료 되었습니다 휴식 시간을 시작 합니다.'
      });
      isBreak = true;
      time = sessions[currentSessionIndex].breakTime * 60;
      updateTitle();
      updateTimer();
      window.Electron.openCheckWindow(); // 점수 입력

      // 자동으로 휴식 타이머 시작
      startTimer();
    }
  } else {
    // 휴식 세션 종료 -> 다음 집중 세션 시작
    isBreak = false;
    currentSessionIndex++;

    if (currentSessionIndex < sessions.length) {
      // 다음 세션으로 넘어가기
      const alertType = "focus_start";
      playAlert(alertType);
      notifyUser({
        title: "알림",
        body: '집중 세션을 시작 합니다.'
      });
      time = sessions[currentSessionIndex].focusTime * 60;
      updateTitle();
      updateTimer();

      // 자동으로 다음 집중 세션 시작
      startTimer();
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
      const alertType = "focus_start";
      playAlert(alertType);
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
    time = isBreak
      ? sessions[currentSessionIndex].breakTime * 60
      : sessions[currentSessionIndex].focusTime * 60;
  } else {
    time = 0;
  }

  updateTimer();
  updateTitle();
  startStopButton.textContent = "시작";
}

function addSession() {
  const sessionNameInput = document.getElementById("sessionName");
  const focusTimeInput = document.getElementById("focusTime");
  const breakTimeInput = document.getElementById("breakTime");
  
  const sessionName = sessionNameInput.value || "세션 이름 없음";
  const focusTime = parseInt(focusTimeInput.value) || 25;
  const breakTime = parseInt(breakTimeInput.value) || 5;

  const session = {
    sessionName,
    focusTime, // Focus time in minutes
    breakTime, // Break time in minutes
  };

  sessions.push(session);
  
  // 입력 필드 초기화 - HTML에 정의된 기본값으로 복원
  sessionNameInput.value = ""; // 세션 이름은 빈 문자열로 초기화
  focusTimeInput.value = "25"; // HTML의 value="25"에 맞춤
  breakTimeInput.value = "5";  // HTML의 value="5"에 맞춤

  // 세션 리스트 UI에 추가
  const sessionItem = document.createElement("li");
  sessionItem.className = "session-item"; // 스타일링을 위한 클래스 추가
  
  // 세션 정보를 담을 span 요소 생성
  const sessionInfo = document.createElement("span");
  sessionInfo.className = "session-info";
  sessionInfo.textContent = `${session.sessionName} - 집중: ${focusTime}분, 휴식: ${breakTime}분`;
  sessionInfo.addEventListener("click", () => {
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
  
  // 삭제 버튼 생성
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = "×"; // X 표시
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    // 세션 배열에서 제거
    const index = sessions.indexOf(session);
    if (index > -1) {
      sessions.splice(index, 1);
    }
    
    // UI에서 제거
    sessionsList.removeChild(sessionItem);
    
    // 현재 선택된 세션을 삭제한 경우 타이머 초기화
    if (currentSessionIndex === index) {
      clearInterval(timerInterval);
      isRunning = false;
      currentSessionIndex = null;
      time = 0;
      updateTimer();
      titleElement.textContent = "포모도로 타이머";
      sesionTitle.textContent = "";
      startStopButton.textContent = "시작";
    } else if (currentSessionIndex > index) {
      // 삭제한 세션이 현재 선택된 세션보다 앞에 있었다면, 인덱스 조정
      currentSessionIndex--;
    }
  });
  
  // 세션 아이템에 세션 정보와 삭제 버튼 추가
  sessionItem.appendChild(sessionInfo);
  sessionItem.appendChild(deleteButton);

  sessionsList.appendChild(sessionItem);
}

document
  .getElementById("addSessionButton")
  .addEventListener("click", addSession);
startStopButton.addEventListener("click", handleStartStop);
resetButton.addEventListener("click", handleReset);

updateTimer();
