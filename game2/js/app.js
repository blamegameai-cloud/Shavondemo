// A variable to hold the SoundJS instance for our music.
let musicInstance;
let muted = false;

// The ID we will use to reference our sound.
const soundID = "backgroundMusic";

// The button element from the HTML.
const muteButton = document.getElementById("mute-button");

/**
 * Preloads the sound and then starts playing it on loop.
 */
function init() {
    // Enable SoundJS to use alternate file types if a preferred one is not supported.
    createjs.Sound.alternateExtensions = ["mp3"];

    // Register and load the sound file.
    createjs.Sound.registerSound("sounds/gameloop.mp3", soundID);

    // Add a listener to start playing the music once it's loaded.
    createjs.Sound.on("fileload", playMusic);
}

/**
 * Plays the sound after it has been loaded.
 */
function playMusic(event) {
    if (event.id === soundID) {
        // Play the sound with looping enabled. The 'loop' property is set to -1 for an infinite loop.
        musicInstance = createjs.Sound.play(soundID, { loop: -1 });
    }
}

/**
 * Toggles the mute state of the music.
 */
function toggleMute() {
    if (musicInstance) {
        // Invert the muted state.
        muted = !muted;

        // Set the volume based on the muted state (0 for mute, 1 for unmute).
        musicInstance.setVolume(muted ? 0 : 1);

        // Update the button text to reflect the current state.
        muteButton.textContent = muted ? "Unmute" : "Mute";
    }
}

// Attach the toggleMute function to the button's click event.
muteButton.addEventListener("click", toggleMute);

// Initialize the sound logic when the page loads.
window.onload = init;
