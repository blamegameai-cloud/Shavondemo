// Define the music file using Howl.
// The 'loop' option is set to true to enable continuous looping.
const music = new Howl({
  src: ['sounds/songloop.mp3', 'sounds/songloop.ogg'], // Use multiple formats for browser compatibility
  loop: true,
  volume: 0.5,
});

// Get the buttons from the HTML
const playButton = document.getElementById('playBtn');
const muteButton = document.getElementById('muteBtn');

let isPlaying = false;
let isMuted = false;

// Handle the play/pause button click
playButton.addEventListener('click', () => {
  if (isPlaying) {
    music.pause();
    playButton.textContent = 'Play Music';
  } else {
    music.play();
    playButton.textContent = 'Pause Music';
  }
  isPlaying = !isPlaying;
});

// Handle the mute button click
muteButton.addEventListener('click', () => {
  if (isMuted) {
    Howler.mute(false); // Unmute all sounds
    muteButton.textContent = 'Mute';
  } else {
    Howler.mute(true); // Mute all sounds
    muteButton.textContent = 'Unmute';
  }
  isMuted = !isMuted;
});
