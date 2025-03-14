const buttons = document.querySelectorAll('.focus-level button');
const selectedScoreText = document.getElementById('selectedScore');
const submitButton = document.getElementById('submitScore');

let selectedScore = 3; // 기본 선택 값

buttons.forEach(button => {
    button.addEventListener('click', () => {
        // 모든 버튼의 'selected' 클래스 제거
        buttons.forEach(btn => btn.classList.remove('selected'));
        
        // 선택된 버튼에 'selected' 클래스 추가
        button.classList.add('selected');

        // 선택한 점수 업데이트
        selectedScore = button.getAttribute('data-score');  // selectedScore
        selectedScoreText.textContent = `선택한 집중도: ${selectedScore}점`;
    });
});

submitButton.addEventListener('click', () => {
    window.Electron.sendFocusScore(selectedScore);
    console.log('선택값', selectedScore)
    window.close(); // 창 닫기
});