// Timer Logic
let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const todoBtn = document.getElementById('todo-btn');
const presetTimes = document.getElementById('preset-times');
const customTimeInput = document.getElementById('custom-time');
const taskbar = document.getElementById('taskbar');
const modal = document.getElementById('app-modal');
const addAppBtn = document.getElementById('add-app-btn');
const confirmAddBtn = document.getElementById('confirm-add');
const browseBtn = document.getElementById('browse-btn');
const appPathInput = document.getElementById('app-path');
const appNameInput = document.getElementById('app-name');
const pinnedAppsContainer = document.getElementById('pinned-apps');
const closeBtn = document.querySelector('.close');

// Initialize
let pinnedApps = JSON.parse(localStorage.getItem('pinnedApps')) || [];
updateDisplay();
renderPinnedApps();

// Timer Functions
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
          new Notification('Time\'s up!');
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
  startBtn.textContent = 'Commit';
}

function resetTimer() {
  pauseTimer();
  minutes = parseInt(presetTimes.value) || 25;
  seconds = 0;
  updateDisplay();
}

// Taskbar Animation
let taskbarTimeout;
taskbar.addEventListener('mouseenter', () => {
  clearTimeout(taskbarTimeout);
  taskbar.style.left = '0';
  document.getElementById('todo-btn').style.left = '200px';
});

taskbar.addEventListener('mouseleave', () => {
  taskbarTimeout = setTimeout(() => {
    taskbar.style.left = '-150px';
    document.getElementById('todo-btn').style.left = '70px';
  }, 300);
});

// Timer Presets
presetTimes.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    customTimeInput.style.display = 'inline-block';
    customTimeInput.focus();
  } else {
    customTimeInput.style.display = 'none';
    minutes = parseInt(e.target.value);
    seconds = 0;
    updateDisplay();
  }
});

customTimeInput.addEventListener('change', (e) => {
  minutes = parseInt(e.target.value) || 25;
  seconds = 0;
  updateDisplay();
});

// App Management
function renderPinnedApps() {
  pinnedAppsContainer.innerHTML = '';
  pinnedApps.forEach((app, index) => {
    const appBtn = document.createElement('button');
    appBtn.className = 'app-btn';
    appBtn.innerHTML = `
      <span class="app-icon">${getAppIcon(app.path)}</span>
      ${app.name}
      <span class="delete-btn" style="margin-left: auto;">❌</span>
    `;
    
    appBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.launchApp(app.path);
      }
    });
    
    const deleteBtn = appBtn.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pinnedApps.splice(index, 1);
      localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
      renderPinnedApps();
    });
    
    pinnedAppsContainer.appendChild(appBtn);
  });
}

// Modal Control
addAppBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

browseBtn.addEventListener('click', async () => {
  if (window.electronAPI) {
    const path = await window.electronAPI.showAppPicker();
    if (path) {
      appPathInput.value = path;
      if (!appNameInput.value) {
        appNameInput.value = path.split('\\').pop().split('/').pop().replace('.exe', '');
      }
    }
  }
});

confirmAddBtn.addEventListener('click', () => {
  const path = appPathInput.value.trim();
  const name = appNameInput.value.trim();
  
  if (path && name) {
    pinnedApps.push({ 
      path, 
      name,
      icon: getAppIcon(path)
    });
    localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
    renderPinnedApps();
    modal.style.display = 'none';
    appPathInput.value = '';
    appNameInput.value = '';
  }
});

// Helper Functions
function getAppIcon(path) {
  if (!path) return '📁';
  const app = path.toLowerCase();
  
  if (app.includes('code.exe') || app.includes('vscode')) return '💻';
  if (app.includes('chrome.exe') || app.includes('firefox')) return '🌐';
  if (app.includes('spotify')) return '🎵';
  if (app.includes('steam')) return '🎮';
  if (app.includes('discord')) return '💬';
  
  return '📁';
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

if (todoBtn && window.electronAPI) {
  todoBtn.addEventListener('click', () => {
    window.electronAPI.openTodoWindow().catch(console.error);
  });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
// --- YouTube Player Setup ---
let player;
let isPlaying = false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  // Update thumbnail when new video loads
  player.addEventListener('onStateChange', (event) => {
    if (event.data === YT.PlayerState.PLAYING) {
      updateThumbnail();
    }
  });
}

function updateThumbnail() {
  const videoId = player.getVideoData().video_id;
  document.getElementById('thumbnail-img').src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  document.getElementById('track-title').textContent = player.getVideoData().title;
}

function playPauseVideo() {
  if (!player) return;
  
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
    // Show the hidden player briefly to start playback
    document.getElementById('youtube-player').style.display = 'block';
    setTimeout(() => {
      document.getElementById('youtube-player').style.display = 'none';
    }, 100);
  }
  isPlaying = !isPlaying;
}

function previousVideo() {
  if (player) player.previousVideo();
}

function nextVideo() {
  if (player) player.nextVideo();
}

function onPlayerStateChange(event) {
  isPlaying = event.data === YT.PlayerState.PLAYING;
  document.querySelector('.player-controls button:nth-child(2)').textContent = 
    isPlaying ? '⏸️' : '⏯️';
  
  if (event.data === YT.PlayerState.PLAYING) {
    updateThumbnail();
  }
}