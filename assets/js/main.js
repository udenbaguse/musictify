const PLAY_ICON = ">";
const PAUSE_ICON = "||";

const songs = [
    { id: 1, name: "Cielo - Huma Huma", file: "1.mp3", cover: "1.jpg", duration: "4:28" },
    { id: 2, name: "DEAF KEV - Invincible", file: "2.mp3", cover: "2.jpg", duration: "3:48" },
    { id: 3, name: "Different Heaven & EH!DE", file: "3.mp3", cover: "3.jpg", duration: "6:25" },
    { id: 4, name: "Janji - Heroes Tonight", file: "4.mp3", cover: "4.jpg", duration: "5:12" },
    { id: 5, name: "Rabba - Salman", file: "5.mp3", cover: "5.jpg", duration: "3:50" },
    { id: 6, name: "Sakhiyaan - Maninder", file: "6.mp3", cover: "6.jpg", duration: "3:31" },
    { id: 7, name: "Bhula Dena - Mustafa", file: "7.mp3", cover: "7.jpg", duration: "4:00" },
    { id: 8, name: "Tumhari Kasam", file: "8.mp3", cover: "8.jpg", duration: "5:02" },
    { id: 9, name: "Na Jaana - Renz", file: "9.mp3", cover: "9.jpg", duration: "4:36" },
    { id: 10, name: "Sahiba - Intense", file: "10.mp3", cover: "10.jpg", duration: "4:26" }
];

const songList = document.getElementById("songList");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentCover = document.getElementById("currentCover");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const navToggle = document.getElementById("navToggle");
const sidebar = document.querySelector(".sidebar");

let currentSongIndex = 0;
const audio = new Audio();
audio.volume = 0.8;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
}

function updatePlayIcon() {
    playPauseBtn.textContent = audio.paused ? PLAY_ICON : PAUSE_ICON;
}

function setSong(index, autoplay = false) {
    currentSongIndex = index;
    const song = songs[index];

    audio.src = `assets/songs/${song.file}`;
    currentTitle.textContent = song.name;
    currentArtist.textContent = "NCS Vibes";
    currentCover.src = `assets/images/covers/${song.cover}`;

    const items = document.querySelectorAll(".song-item");
    items.forEach((item, itemIndex) => {
        item.classList.toggle("active", itemIndex === index);
        const songPlay = item.querySelector(".song-play");
        songPlay.textContent = itemIndex === index && !audio.paused ? PAUSE_ICON : PLAY_ICON;
    });

    progressBar.value = 0;
    currentTime.textContent = "0:00";

    if (autoplay) {
        audio.play();
    }

    updatePlayIcon();
}

function toggleSongFromList(index) {
    if (index === currentSongIndex) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        updateListPlayButtons();
        updatePlayIcon();
        return;
    }

    setSong(index, true);
    updateListPlayButtons();
    updatePlayIcon();
}

function updateListPlayButtons() {
    document.querySelectorAll(".song-item").forEach((item, index) => {
        const songPlay = item.querySelector(".song-play");
        const isActive = index === currentSongIndex;

        item.classList.toggle("active", isActive);
        songPlay.textContent = isActive && !audio.paused ? PAUSE_ICON : PLAY_ICON;
    });
}

function renderSongs() {
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
            `
        )
        .join("");

    songList.querySelectorAll(".song-play").forEach((button) => {
        button.addEventListener("click", (event) => {
            const songItem = event.currentTarget.closest(".song-item");
            const index = Number(songItem.dataset.index);
            toggleSongFromList(index);
        });
    });
}

playPauseBtn.addEventListener("click", () => {
    if (!audio.src) {
        setSong(currentSongIndex, true);
        updateListPlayButtons();
        return;
    }

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }

    updatePlayIcon();
    updateListPlayButtons();
});

nextBtn.addEventListener("click", () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setSong(nextIndex, true);
    updateListPlayButtons();
});

prevBtn.addEventListener("click", () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setSong(prevIndex, true);
    updateListPlayButtons();
});

progressBar.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    audio.currentTime = (Number(progressBar.value) / 100) * audio.duration;
});

volumeBar.addEventListener("input", () => {
    audio.volume = Number(volumeBar.value) / 100;
});

audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    progressBar.value = ((audio.currentTime / audio.duration) * 100).toString();
    currentTime.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
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
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setSong(nextIndex, true);
    updateListPlayButtons();
});

if (navToggle && sidebar) {
    navToggle.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

renderSongs();
setSong(0);
