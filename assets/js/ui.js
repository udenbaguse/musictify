// ========== UI RENDER & EVENT LISTENERS ==========

// DOM Elements - initialized later
let loginPage, registerPage, mainApp, loginForm, registerForm;
let userAvatar, userNameEl, userEmailEl;
let songList, playPauseBtn, playIcon, prevBtn, nextBtn;
let progressBar, volumeBar, currentTitle, currentArtist, currentCover;
let currentTimeEl, durationEl;
let menuItems;
let shuffleBtn, repeatBtn, volumeMuteBtn, volumeIcon;

function renderSongs() {
  if (!songList) return;

  songList.innerHTML = songs
    .map(
      (song, index) => `
        <article class="song-item ${index === 0 ? "active" : ""}" data-index="${index}">
            <img src="assets/images/covers/${song.cover}" alt="${song.name}">
            <div class="song-meta">
                <h3>${song.name}</h3>
                <p>NCS Vibes</p>
            </div>
            <span class="song-duration">${song.duration}</span>
            <button class="song-play" type="button" aria-label="Play ${song.name}">${PLAY_ICON}</button>
        </article>
    `,
    )
    .join("");

  songList.querySelectorAll(".song-play").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const songItem = event.currentTarget.closest(".song-item");
      if (songItem) toggleSongFromList(Number(songItem.dataset.index));
    });
  });

  songList.querySelectorAll(".song-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("song-play")) return;
      toggleSongFromList(Number(item.dataset.index));
    });
  });
}

function toggleSongFromList(index) {
  if (index === currentSongIndex) {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    updateListPlayButtons();
    updatePlayIcon();
    return;
  }
  setSong(index, true);
  updateListPlayButtons();
  updatePlayIcon();
}

function initDOMElements() {
  loginPage = document.getElementById("loginPage");
  registerPage = document.getElementById("registerPage");
  mainApp = document.getElementById("mainApp");
  loginForm = document.getElementById("loginForm");
  registerForm = document.getElementById("registerForm");

  userAvatar = document.getElementById("userAvatar");
  userNameEl = document.getElementById("userName");
  userEmailEl = document.getElementById("userEmail");

  songList = document.getElementById("songList");
  playPauseBtn = document.getElementById("playPauseBtn");
  playIcon = document.getElementById("playIcon");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  progressBar = document.getElementById("progressBar");
  volumeBar = document.getElementById("volumeBar");
  currentTitle = document.getElementById("currentTitle");
  currentArtist = document.getElementById("currentArtist");
  currentCover = document.getElementById("currentCover");
  currentTimeEl = document.getElementById("currentTime");
  durationEl = document.getElementById("duration");

  menuItems = document.querySelectorAll(".menu-item[data-page]");
  shuffleBtn = document.getElementById("shuffleBtn");
  repeatBtn = document.getElementById("repeatBtn");
  volumeMuteBtn = document.getElementById("volumeMuteBtn");
  volumeIcon = document.getElementById("volumeIcon");
}

function setupEventListeners() {
  // Local auth form listeners
  if (loginForm) loginForm.addEventListener("submit", handleLocalLogin);
  if (registerForm)
    registerForm.addEventListener("submit", handleLocalRegister);

  // Navigation links
  const showLoginLink = document.querySelectorAll('[onclick*="showLogin"]');
  const showRegisterLink = document.querySelectorAll(
    '[onclick*="showRegister"]',
  );
  showLoginLink.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showLogin();
    });
  });
  showRegisterLink.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showRegister();
    });
  });

  // Player controls
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if (!audio.src || audio.src === window.location.href) {
        setSong(currentSongIndex, true);
        updateListPlayButtons();
        return;
      }
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
      updatePlayIcon();
      updateListPlayButtons();
    });
  }

  if (nextBtn) nextBtn.addEventListener("click", playNext);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (audio.currentTime > 3) audio.currentTime = 0;
      else setSong((currentSongIndex - 1 + songs.length) % songs.length, true);
      updateListPlayButtons();
      updatePlayIcon();
    });
  }

  if (progressBar) {
    progressBar.addEventListener("input", () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      audio.currentTime = (Number(progressBar.value) / 100) * audio.duration;
    });
  }

  if (volumeBar) {
    volumeBar.addEventListener("input", () => {
      audio.volume = Number(volumeBar.value) / 100;
      previousVol = audio.volume * 100;
      updateVolumeIcon();
    });
  }

  if (volumeMuteBtn) {
    volumeMuteBtn.addEventListener("click", () => {
      if (audio.volume > 0) {
        previousVol = audio.volume * 100;
        audio.volume = 0;
        if (volumeBar) volumeBar.value = 0;
      } else {
        audio.volume = previousVol / 100;
        if (volumeBar) volumeBar.value = previousVol;
      }
      updateVolumeIcon();
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      shuffleMode = !shuffleMode;
      updateShuffleIcon();
    });
  }

  if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
      repeatMode = !repeatMode;
      updateRepeatIcon();
    });
  }

  // Audio event listeners
  audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    if (progressBar)
      progressBar.value = (
        (audio.currentTime / audio.duration) *
        100
      ).toString();
    if (currentTimeEl)
      currentTimeEl.textContent = formatTime(audio.currentTime);
    if (durationEl) durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("loadedmetadata", () => {
    if (durationEl) durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("play", () => {
    updatePlayIcon();
    updateListPlayButtons();
  });

  audio.addEventListener("pause", () => {
    updatePlayIcon();
    updateListPlayButtons();
  });

  audio.addEventListener("ended", () => {
    if (repeatMode) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      playNext();
    }
  });

  // Menu navigation
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((i) => i.classList.remove("is-active"));
      item.classList.add("is-active");
    });
  });
}
