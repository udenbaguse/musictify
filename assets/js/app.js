// ========== APPLICATION INITIALIZATION ==========

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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
