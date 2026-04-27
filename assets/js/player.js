// ========== PLAYER FUNCTIONS ==========

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function updatePlayIcon() {
  if (!playIcon) return;
  playIcon.className = audio.paused ? "fas fa-play" : "fas fa-pause";
}

function updateShuffleIcon() {
  if (!shuffleBtn) return;
  shuffleBtn.style.color = shuffleMode ? "var(--brand)" : "";
  shuffleBtn.style.opacity = shuffleMode ? "1" : "0.6";
}

function updateRepeatIcon() {
  if (!repeatBtn) return;
  repeatBtn.style.color = repeatMode ? "var(--brand)" : "";
  repeatBtn.style.opacity = repeatMode ? "1" : "0.6";
}

function updateVolumeIcon() {
  if (!volumeIcon) return;
  const vol = audio.volume;
  if (vol === 0) volumeIcon.className = "fas fa-volume-mute";
  else if (vol < 0.5) volumeIcon.className = "fas fa-volume-down";
  else volumeIcon.className = "fas fa-volume-up";
}

function setSong(index, autoplay = false) {
  if (index < 0 || index >= songs.length) return;

  currentSongIndex = index;
  const song = songs[index];

  audio.src = `assets/songs/${song.file}`;
  if (currentTitle) currentTitle.textContent = song.name;
  if (currentArtist) currentArtist.textContent = "NCS Vibes";
  if (currentCover) currentCover.src = `assets/images/covers/${song.cover}`;

  document.querySelectorAll(".song-item").forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === index);
    const songPlay = item.querySelector(".song-play");
    if (songPlay) {
      songPlay.innerHTML =
        itemIndex === index && !audio.paused ? PAUSE_ICON : PLAY_ICON;
    }
  });

  if (progressBar) progressBar.value = 0;
  if (currentTimeEl) currentTimeEl.textContent = "0:00";

  if (autoplay) audio.play().catch(() => {});

  updatePlayIcon();
  updateListPlayButtons();
}

function updateListPlayButtons() {
  document.querySelectorAll(".song-item").forEach((item, index) => {
    const songPlay = item.querySelector(".song-play");
    const isActive = index === currentSongIndex;
    item.classList.toggle("active", isActive);
    if (songPlay) {
      songPlay.innerHTML = isActive && !audio.paused ? PAUSE_ICON : PLAY_ICON;
    }
  });
}

function playNext() {
  let nextIndex;
  if (shuffleMode) {
    nextIndex = Math.floor(Math.random() * songs.length);
    if (nextIndex === currentSongIndex && songs.length > 1) {
      nextIndex = (nextIndex + 1) % songs.length;
    }
  } else {
    nextIndex = (currentSongIndex + 1) % songs.length;
  }
  setSong(nextIndex, true);
  updateListPlayButtons();
}
