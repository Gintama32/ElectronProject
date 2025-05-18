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
const missionAccomplishedBtn = document.getElementById('mission-accomplished-btn');

// Add type selector handler
const addTypeSelect = document.getElementById('add-type');
const appInputGroup = document.getElementById('app-input-group');
const websiteInputGroup = document.getElementById('website-input-group');
const websiteUrlInput = document.getElementById('website-url');

// Initialize
let pinnedApps = JSON.parse(localStorage.getItem('pinnedApps')) || [];

// Add default apps if pinnedApps is empty
if (pinnedApps.length === 0) {
  pinnedApps = [
    {
      name: 'LeetCode',
      path: 'leetcode',
      icon: '🧩',
      isWebApp: true
    }
  ];
  localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
}

// Make sure LeetCode is in the apps list
if (!pinnedApps.some(app => app.path === 'leetcode')) {
  pinnedApps.push({
    name: 'LeetCode',
    path: 'leetcode',
    icon: '🧩',
    isWebApp: true
  });
  localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
}

updateDisplay();
renderPinnedApps();

// Timer Functions
function updateDisplay() {
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playAlarmSound() {
  // Create oscillator for alarm sound
  const context = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create multiple oscillators for a more attention-grabbing sound
  const oscillators = [];
  const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5 notes
  
  frequencies.forEach(frequency => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    
    // Create a repeating beep effect
    gainNode.gain.setValueAtTime(0, context.currentTime);
    
    // Create 3 beeps
    for(let i = 0; i < 3; i++) {
      // Beep on
      gainNode.gain.setValueAtTime(0.3, context.currentTime + i * 0.6);
      gainNode.gain.setValueAtTime(0.3, context.currentTime + i * 0.6 + 0.2);
      // Beep off
      gainNode.gain.setValueAtTime(0, context.currentTime + i * 0.6 + 0.4);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillators.push(oscillator);
  });
  
  // Start and stop all oscillators
  oscillators.forEach(osc => {
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 2);
  });
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startBtn.textContent = 'Pause';
    if (window.electronAPI) {
      window.electronAPI.toggleFocusMode(true);
    }
    // Add focus mode class
    document.body.classList.add('focus-mode');
    
    timer = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(timer);
          playAlarmSound();
          new Notification('Time\'s up!', {
            body: 'Your focus session is complete!',
            icon: 'data:image/png;base64,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'
          });
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
  if (window.electronAPI) {
    window.electronAPI.toggleFocusMode(false);
  }
  // Remove focus mode class
  document.body.classList.remove('focus-mode');
}

function resetTimer() {
  pauseTimer();
  minutes = parseInt(presetTimes.value) || 25;
  seconds = 0;
  updateDisplay();
  if (window.electronAPI) {
    window.electronAPI.toggleFocusMode(false);
  }
  // Remove focus mode class
  document.body.classList.remove('focus-mode');
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

// Preload sounds
const menuSound = document.getElementById('menu-click');
const mediaSound = document.getElementById('media-click');
const buttonSound = document.getElementById('button-click');

// Optimize sound functions
function playMenuSound() {
  try {
    const soundClone = menuSound.cloneNode(true);
    soundClone.volume = 0.5;
    soundClone.play();
    soundClone.onended = () => soundClone.remove();
  } catch (err) {
    console.error('Error playing menu sound:', err);
  }
}

function playMediaSound() {
  try {
    const soundClone = mediaSound.cloneNode(true);
    soundClone.volume = 0.5;
    soundClone.play();
    soundClone.onended = () => soundClone.remove();
  } catch (err) {
    console.error('Error playing media sound:', err);
  }
}

// App Management with optimized sound
function renderPinnedApps() {
  pinnedAppsContainer.innerHTML = '';
  pinnedApps.forEach((app, index) => {
    const appBtn = document.createElement('button');
    appBtn.className = 'app-btn';
    appBtn.innerHTML = `
      <span class="app-icon">${app.icon || getAppIcon(app.path)}</span>
      <span class="app-name">${app.name}</span>
      <span class="delete-btn">❌</span>
    `;
    
    appBtn.addEventListener('click', () => {
      playMenuSound();
      if (app.isWebApp) {
        if (app.path === 'leetcode' && window.electronAPI) {
          window.electronAPI.openLeetcode();
        } else if (window.electronAPI) {
          window.electronAPI.openWebsite(app.path);
        }
      } else if (window.electronAPI) {
        window.electronAPI.launchApp(app.path);
      }
    });
    
    const deleteBtn = appBtn.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playMenuSound();
      pinnedApps.splice(index, 1);
      localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
      renderPinnedApps();
    });
    
    pinnedAppsContainer.appendChild(appBtn);
  });
}

// Helper Functions
function getAppIcon(path) {
  if (!path) return '📁';
  const app = path.toLowerCase();
  
  if (app === 'leetcode') return '🧩';
  if (app.includes('code.exe') || app.includes('vscode')) return '💻';
  if (app.includes('chrome.exe') || app.includes('firefox')) return '🌐';
  if (app.includes('spotify')) return '🎵';
  if (app.includes('steam')) return '🎮';
  if (app.includes('discord')) return '💬';
  if (app.startsWith('http') || app.startsWith('https')) return '🌐';
  
  return '📁';
}

// Modal Control with optimized sound
addAppBtn.addEventListener('click', () => {
  playMenuSound();
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  playMenuSound();
  modal.style.display = 'none';
  appPathInput.value = '';
  appNameInput.value = '';
});

browseBtn.addEventListener('click', async () => {
  playMenuSound();
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

// Event Listeners
startBtn.addEventListener('click', () => {
  document.getElementById('button-click').currentTime = 0;
  document.getElementById('button-click').play()
    .catch(err => console.error('Error playing button click sound:', err));
  startTimer();
});

resetBtn.addEventListener('click', () => {
  document.getElementById('button-click').currentTime = 0;
  document.getElementById('button-click').play()
    .catch(err => console.error('Error playing button click sound:', err));
  resetTimer();
});

todoBtn.addEventListener('click', () => {
  document.getElementById('button-click').currentTime = 0;
  document.getElementById('button-click').play()
    .catch(err => console.error('Error playing button click sound:', err));
  if (window.electronAPI) {
    window.electronAPI.openTodoWindow();
  }
});

// Mission Accomplished Button
missionAccomplishedBtn.addEventListener('click', async () => {
  // Prevent multiple clicks
  if (missionAccomplishedBtn.classList.contains('loading')) return;
  
  // Play success sound
  createSuccessSound();
  
  // Add loading class
  missionAccomplishedBtn.classList.add('loading');
  
  // Update text with celebration emoji
  const textSpan = document.createElement('span');
  textSpan.textContent = '🎉 Great Work!';
  missionAccomplishedBtn.innerHTML = '';
  missionAccomplishedBtn.appendChild(textSpan);
  missionAccomplishedBtn.appendChild(document.createElement('div')).className = 'loading-spinner';
  
  // Show a celebratory message
  new Notification('🎉 Great Work Today!', {
    body: 'You\'ve accomplished your goals. See you next time!'
  });
  
  // Close the application after a short delay to show the notification
  setTimeout(() => {
    if (window.electronAPI) {
      window.electronAPI.closeApp();
  }
  }, 1500);
});

// YouTube Player Setup
let player;
let isPlaying = false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    },
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'mute': 0,
      'playsinline': 1
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
  // Set initial thumbnail
  updateThumbnail();
}

function updateThumbnail() {
  const videoId = player.getVideoData().video_id;
  document.getElementById('thumbnail-img').src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  document.getElementById('track-title').textContent = player.getVideoData().title;
}

// YouTube Player Controls
function playPauseVideo() {
  try {
    playMediaSound();
    
  if (!player) return;
  
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
      // Remove the display none to allow audio to work
      document.getElementById('youtube-player').style.visibility = 'hidden';
    document.getElementById('youtube-player').style.display = 'block';
      document.getElementById('youtube-player').style.height = '0';
  }
  isPlaying = !isPlaying;
    
    // Update button icon
    const playPauseBtn = document.querySelector('.player-controls button:nth-child(2)');
    if (playPauseBtn) {
      playPauseBtn.textContent = isPlaying ? '⏸️' : '⏯️';
    }
  } catch (error) {
    console.error('Error in playPauseVideo:', error);
  }
}

function previousVideo() {
  try {
    playMediaSound();
    if (player) {
      player.previousVideo();
    }
  } catch (error) {
    console.error('Error in previousVideo:', error);
  }
}

function nextVideo() {
  try {
    playMediaSound();
    if (player) {
      player.nextVideo();
    }
  } catch (error) {
    console.error('Error in nextVideo:', error);
  }
}

function onPlayerStateChange(event) {
  isPlaying = event.data === YT.PlayerState.PLAYING;
  document.querySelector('.player-controls button:nth-child(2)').textContent = 
    isPlaying ? '⏸️' : '⏯️';
  
  if (event.data === YT.PlayerState.PLAYING) {
    updateThumbnail();
  }
}

// Make sure these functions are available globally
window.playPauseVideo = playPauseVideo;
window.previousVideo = previousVideo;
window.nextVideo = nextVideo;

// Add type selector handler
addTypeSelect.addEventListener('change', () => {
  if (addTypeSelect.value === 'website') {
    appInputGroup.style.display = 'none';
    websiteInputGroup.style.display = 'flex';
  } else {
    appInputGroup.style.display = 'flex';
    websiteInputGroup.style.display = 'none';
  }
});

// Update confirmAddBtn click handler
confirmAddBtn.addEventListener('click', () => {
  playMenuSound();
  let path, name;
  
  if (addTypeSelect.value === 'website') {
    path = websiteUrlInput.value.trim();
    name = appNameInput.value.trim() || new URL(path).hostname;
    
    // Ensure URL has protocol
    if (!path.startsWith('http://') && !path.startsWith('https://')) {
      path = 'https://' + path;
    }
  } else {
    path = appPathInput.value.trim();
    name = appNameInput.value.trim();
  }
  
  if (path && name) {
    pinnedApps.push({ 
      path, 
      name,
      icon: getAppIcon(path),
      isWebApp: addTypeSelect.value === 'website'
    });
    localStorage.setItem('pinnedApps', JSON.stringify(pinnedApps));
    renderPinnedApps();
    modal.style.display = 'none';
    appPathInput.value = '';
    websiteUrlInput.value = '';
    appNameInput.value = '';
  }
});