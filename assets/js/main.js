const PLAY_ICON = '>';
const PAUSE_ICON = '||';
const CLERK_PUB_KEY = 'pk_test_aW1wcm92ZWQtZG92ZS05MC5jbGVyay5hY2NvdW50cy5kZXYk';

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

let currentSongIndex = 0;
let shuffleMode = false;
let repeatMode = false;
let previousVol = 80;
let clerkLoaded = false;
let clerkInstance = null;

const audio = new Audio();
audio.volume = 0.8;

// DOM Elements - initialized later
let loginPage, registerPage, mainApp, loginForm, registerForm;
let userAvatar, userNameEl, userEmailEl;
let songList, playPauseBtn, playIcon, prevBtn, nextBtn;
let progressBar, volumeBar, currentTitle, currentArtist, currentCover;
let currentTimeEl, durationEl;
let menuItems;
let shuffleBtn, repeatBtn, volumeMuteBtn, volumeIcon;

// ========== CLERK INTEGRATION ==========

function initClerk() {
    if (typeof Clerk === 'undefined') {
        console.warn('Clerk SDK not loaded, using local auth');
        initLocalAuth();
        return;
    }

    clerkInstance = new Clerk(CLERK_PUB_KEY);
    
        clerkInstance.load({
        appearance: {
            layout: {
                socialButtonsVariant: 'iconButton',
                socialButtonsPlacement: 'bottom'
            },
            elements: {
                formButtonPrimary: 'clerk-btn-primary',
                card: 'clerk-card',
                headerTitle: 'clerk-header',
                footer: 'clerk-footer',
                dividerLine: 'clerk-divider',
                dividerText: 'clerk-divider-text',
                identityPreviewAvatarBox: 'clerk-avatar',
                formFieldInput: 'clerk-input',
                formFieldLabel: 'clerk-label'
            },
            variables: {
                colorPrimary: '#1ed760',
                colorBackground: '#07120f',
                colorInputBackground: 'rgba(255,255,255,0.03)',
                colorText: '#edf7f2',
                colorTextOnBrandPrimary: '#07270f'
            }
        }
    }).then(() => {
        clerkLoaded = true;
        
        // Check if user already signed in
        if (clerkInstance.user) {
            onClerkAuthSuccess(clerkInstance.user);
        }
    }).catch(err => {
        console.warn('Clerk init failed, using local auth:', err);
        initLocalAuth();
    });
}

function onClerkAuthSuccess(user) {
    if (!user) return;
    
    const userName = user.firstName + ' ' + user.lastName || 
                     user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 
                     user.email?.split('@')[0] || 'User';
    const userEmail = user.emailAddresses?.[0]?.emailAddress || user.email || '';
    
    if (loginPage) loginPage.classList.add('hidden');
    if (registerPage) registerPage.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    if (userAvatar) userAvatar.textContent = userName.trim().charAt(0).toUpperCase();
    if (userNameEl) userNameEl.textContent = userName;
    if (userEmailEl) userEmailEl.textContent = userEmail;
    
    localStorage.setItem('musictify_user', JSON.stringify({
        id: user.id || user.userId,
        name: userName,
        email: userEmail,
        clerkUser: true,
        isLoggedIn: true
    }));
}

function signOut() {
    localStorage.removeItem('musictify_user');
    if (mainApp) mainApp.classList.add('hidden');
    if (loginPage) loginPage.classList.remove('hidden');
}

function attemptGoogleLogin() {
    // Note: Google OAuth would require active Clerk instance or OAuth redirect
    // For demo purposes, fall back to local auth with notice
    const notice = document.createElement('div');
    notice.style.cssText = 'background:rgba(219,68,55,0.2);border:1px solid rgba(219,68,55,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#DB4437;font-size:13px;text-align:center;';
    notice.textContent = 'Google OAuth requires Clerk backend. Use email login or sign up.';
    document.getElementById('loginForm').prepend(notice);
    setTimeout(() => notice.remove(), 5000);
}

function attemptFacebookLogin() {
    const notice = document.createElement('div');
    notice.style.cssText = 'background:rgba(66,103,178,0.2);border:1px solid rgba(66,103,178,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#4267B2;font-size:13px;text-align:center;';
    notice.textContent = 'Facebook OAuth requires Clerk backend. Use email login or sign up.';
    document.getElementById('loginForm').prepend(notice);
    setTimeout(() => notice.remove(), 5000);
}

function attemptGoogleRegister() {
    const notice = document.createElement('div');
    notice.style.cssText = 'background:rgba(219,68,55,0.2);border:1px solid rgba(219,68,55,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#DB4437;font-size:13px;text-align:center;';
    notice.textContent = 'Google OAuth requires Clerk backend. Use email sign up or login.';
    document.getElementById('registerForm').prepend(notice);
    setTimeout(() => notice.remove(), 5000);
}

function attemptFacebookRegister() {
    const notice = document.createElement('div');
    notice.style.cssText = 'background:rgba(66,103,178,0.2);border:1px solid rgba(66,103,178,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#4267B2;font-size:13px;text-align:center;';
    notice.textContent = 'Facebook OAuth requires Clerk backend. Use email sign up or login.';
    document.getElementById('registerForm').prepend(notice);
    setTimeout(() => notice.remove(), 5000);
}

function clerkSignInWithGoogle() {
    if (clerkLoaded && clerkInstance) {
        clerkInstance.openSignIn({ strategy: 'oauth_google' });
    }
}

function clerkSignInWithFacebook() {
    if (clerkLoaded && clerkInstance) {
        clerkInstance.openSignIn({ strategy: 'oauth_facebook' });
    }
}

function clerkSignUpWithGoogle() {
    if (clerkLoaded && clerkInstance) {
        clerkInstance.openSignUp({ strategy: 'oauth_google' });
    }
}

function clerkSignUpWithFacebook() {
    if (clerkLoaded && clerkInstance) {
        clerkInstance.openSignUp({ strategy: 'oauth_facebook' });
    }
}

// ========== LOCAL AUTH ==========

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleLocalLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    
    let valid = true;
    
    const emailErr = document.getElementById('loginEmailErr');
    const passErr = document.getElementById('loginPasswordErr');
    if (emailErr) emailErr.textContent = '';
    if (passErr) passErr.textContent = '';
    
    // Clear errors on input
    document.getElementById('loginEmail').addEventListener('input', function() {
        if (emailErr) emailErr.textContent = '';
    });
    document.getElementById('loginPassword').addEventListener('input', function() {
        if (passErr) passErr.textContent = '';
    });
    
    if (!email) {
        if (emailErr) emailErr.textContent = 'Email is required';
        valid = false;
    } else if (!validateEmail(email)) {
        if (emailErr) emailErr.textContent = 'Please enter a valid email';
        valid = false;
    }
    
    if (!pass) {
        if (passErr) passErr.textContent = 'Password is required';
        valid = false;
    } else if (pass.length < 6) {
        if (passErr) passErr.textContent = 'Password must be at least 6 characters';
        valid = false;
    }
    
    if (!valid) return false;
    
    const users = JSON.parse(localStorage.getItem('musictify_users') || '[]');
    const user = users.find(u => u.email === email && u.password === pass);
    
    if (!user) {
        if (passErr) passErr.textContent = 'Invalid email or password';
        return false;
    }
    
    localStorage.setItem('musictify_user', JSON.stringify(user));
    showApp(user);
    return true;
}

function handleLocalRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    
    let valid = true;
    
    const nameErr = document.getElementById('regNameErr');
    const emailErr = document.getElementById('regEmailErr');
    const passErr = document.getElementById('regPasswordErr');
    if (nameErr) nameErr.textContent = '';
    if (emailErr) emailErr.textContent = '';
    if (passErr) passErr.textContent = '';
    
    // Clear errors on input
    document.getElementById('regName').addEventListener('input', function() {
        if (nameErr) nameErr.textContent = '';
    });
    document.getElementById('regEmail').addEventListener('input', function() {
        if (emailErr) emailErr.textContent = '';
    });
    document.getElementById('regPassword').addEventListener('input', function() {
        if (passErr) passErr.textContent = '';
    });
    
    if (!name) {
        if (nameErr) nameErr.textContent = 'Name is required';
        valid = false;
    } else if (name.length < 2) {
        if (nameErr) nameErr.textContent = 'Name must be at least 2 characters';
        valid = false;
    }
    
    if (!email) {
        if (emailErr) emailErr.textContent = 'Email is required';
        valid = false;
    } else if (!validateEmail(email)) {
        if (emailErr) emailErr.textContent = 'Please enter a valid email';
        valid = false;
    }
    
    if (!pass) {
        if (passErr) passErr.textContent = 'Password is required';
        valid = false;
    } else if (pass.length < 6) {
        if (passErr) passErr.textContent = 'Password must be at least 6 characters';
        valid = false;
    }
    
    if (!valid) return false;
    
    const users = JSON.parse(localStorage.getItem('musictify_users') || '[]');
    if (users.find(u => u.email === email)) {
        if (emailErr) emailErr.textContent = 'Email already registered. Please log in.';
        return false;
    }
    
    const user = { name, email, password: pass };
    users.push(user);
    localStorage.setItem('musictify_users', JSON.stringify(users));
    user.isLoggedIn = true;
    localStorage.setItem('musictify_user', JSON.stringify(user));
    showApp(user);
    return true;
}

function initLocalAuth() {
    // Only auto-login if explicitly marked as logged in
    // Don't auto-login on page refresh to show auth forms
    const user = JSON.parse(localStorage.getItem('musictify_user'));
    if (user && user.isLoggedIn) {
        showApp(user);
    } else {
        showLogin();
    }
}

function showLogin() {
    if (loginPage) loginPage.classList.remove('hidden');
    if (registerPage) registerPage.classList.add('hidden');
    if (mainApp) mainApp.classList.add('hidden');
}

function showRegister() {
    if (loginPage) loginPage.classList.add('hidden');
    if (registerPage) registerPage.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
}

function showApp(user) {
    if (loginPage) loginPage.classList.add('hidden');
    if (registerPage) registerPage.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    if (user && userAvatar && userNameEl && userEmailEl) {
        userAvatar.textContent = (user.name || user.email || 'U').charAt(0).toUpperCase();
        userNameEl.textContent = user.name || user.email || 'User';
        userEmailEl.textContent = user.email || '';
    }
}

// ========== PLAYER FUNCTIONS ==========

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
}

function updatePlayIcon() {
    if (!playIcon) return;
    playIcon.className = audio.paused ? 'fas fa-play' : 'fas fa-pause';
}

function updateShuffleIcon() {
    if (!shuffleBtn) return;
    shuffleBtn.style.color = shuffleMode ? 'var(--brand)' : '';
    shuffleBtn.style.opacity = shuffleMode ? '1' : '0.6';
}

function updateRepeatIcon() {
    if (!repeatBtn) return;
    repeatBtn.style.color = repeatMode ? 'var(--brand)' : '';
    repeatBtn.style.opacity = repeatMode ? '1' : '0.6';
}

function updateVolumeIcon() {
    if (!volumeIcon) return;
    const vol = audio.volume;
    if (vol === 0) volumeIcon.className = 'fas fa-volume-mute';
    else if (vol < 0.5) volumeIcon.className = 'fas fa-volume-down';
    else volumeIcon.className = 'fas fa-volume-up';
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
            songPlay.innerHTML = itemIndex === index && !audio.paused ? PAUSE_ICON : PLAY_ICON;
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

function renderSongs() {
    if (!songList) return;
    
    songList.innerHTML = songs.map((song, index) => `
        <article class="song-item ${index === 0 ? "active" : ""}" data-index="${index}">
            <img src="assets/images/covers/${song.cover}" alt="${song.name}">
            <div class="song-meta">
                <h3>${song.name}</h3>
                <p>NCS Vibes</p>
            </div>
            <span class="song-duration">${song.duration}</span>
            <button class="song-play" type="button" aria-label="Play ${song.name}">${PLAY_ICON}</button>
        </article>
    `).join("");
    
    songList.querySelectorAll(".song-play").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const songItem = event.currentTarget.closest(".song-item");
            if (songItem) toggleSongFromList(Number(songItem.dataset.index));
        });
    });
    
    songList.querySelectorAll(".song-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            if (e.target.classList.contains('song-play')) return;
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

// ========== INITIALIZATION ==========

function initDOMElements() {
    loginPage = document.getElementById('loginPage');
    registerPage = document.getElementById('registerPage');
    mainApp = document.getElementById('mainApp');
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    
    userAvatar = document.getElementById('userAvatar');
    userNameEl = document.getElementById('userName');
    userEmailEl = document.getElementById('userEmail');
    
    songList = document.getElementById('songList');
    playPauseBtn = document.getElementById('playPauseBtn');
    playIcon = document.getElementById('playIcon');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    progressBar = document.getElementById('progressBar');
    volumeBar = document.getElementById('volumeBar');
    currentTitle = document.getElementById('currentTitle');
    currentArtist = document.getElementById('currentArtist');
    currentCover = document.getElementById('currentCover');
    currentTimeEl = document.getElementById('currentTime');
    durationEl = document.getElementById('duration');
    
    menuItems = document.querySelectorAll('.menu-item[data-page]');
    shuffleBtn = document.getElementById('shuffleBtn');
    repeatBtn = document.getElementById('repeatBtn');
    volumeMuteBtn = document.getElementById('volumeMuteBtn');
    volumeIcon = document.getElementById('volumeIcon');
}

function setupEventListeners() {
    // Local auth form listeners
    if (loginForm) loginForm.addEventListener('submit', handleLocalLogin);
    if (registerForm) registerForm.addEventListener('submit', handleLocalRegister);
    
    // Navigation links
    const showLoginLink = document.querySelectorAll('[onclick*="showLogin"]');
    const showRegisterLink = document.querySelectorAll('[onclick*="showRegister"]');
    showLoginLink.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    });
    showRegisterLink.forEach(el => {
        el.addEventListener('click', (e) => {
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
        if (progressBar) progressBar.value = ((audio.currentTime / audio.duration) * 100).toString();
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
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
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('is-active'));
            item.classList.add('is-active');
        });
    });
}

// ========== START ==========

function init() {
    initDOMElements();
    setupEventListeners();
    renderSongs();
    setSong(0);
    updateShuffleIcon();
    updateRepeatIcon();
    updateVolumeIcon();
    
    // Try Clerk first, fallback to local
    initClerk();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
