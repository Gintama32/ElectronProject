// Timer Logic
let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

function updateDisplay() {
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startBtn.textContent = 'Pause';
    timer = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(timer);
          alert("Time's up!");
          resetTimer();
          return;
        }
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }
      updateDisplay();
    }, 1000);
  } else {
    pauseTimer();
  }
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  startBtn.textContent = 'Start';
}

function resetTimer() {
  pauseTimer();
  minutes = 25;
  seconds = 0;
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// To-Do Button
document.getElementById('todo-btn').addEventListener('click', () => {
  window.electronAPI.openTodoWindow().catch(err => console.error(err));
});

// Initial display
updateDisplay();