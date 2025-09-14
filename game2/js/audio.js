(function() {
    "use strict";

    // A unique ID for our sound instance
    var soundID = "myLoop";
    var soundInstance;

    // Wait for the window to load before registering sounds
    window.onload = function() {
        // Register the sound file and give it a unique ID.
        // Replace 'path/to/your_audio.mp3' with your actual audio file path.
        // It is a good practice to provide multiple formats for broader browser support.
        createjs.Sound.registerSound({src:"sounds/gameloop.mp3", id:soundID});

        // Add a handler for when the sound file is loaded
        createjs.Sound.on("fileload", handleLoad);
    };

    function handleLoad(event) {
        // Play the sound after it has been loaded
        // The `loop` parameter is set to -1 for an infinite loop.
        soundInstance = createjs.Sound.play(soundID, {loop: -1});

        // Set up the mute button
        var muteButton = document.getElementById("muteButton");
        muteButton.addEventListener("click", toggleMute);
    }

    function toggleMute() {
        // Toggle the global `muted` property of SoundJS
        createjs.Sound.muted = !createjs.Sound.muted;

        // Update the button text to reflect the current state
        var muteButton = document.getElementById("muteButton");
        if (createjs.Sound.muted) {
            muteButton.textContent = "Unmute";
        } else {
            muteButton.textContent = "Mute";
        }
    }
})();
