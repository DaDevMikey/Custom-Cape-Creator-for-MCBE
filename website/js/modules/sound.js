// Sound management for the application

const sounds = {
    click: 'Minecraft - Buttonplate Click (Sound Eff.mp3',
    success: 'pling.ogg'
};

let soundsEnabled = true;

function initSounds() {
    // Pre-load sounds
    for (const [key, path] of Object.entries(sounds)) {
        // Create audio element but don't play it yet
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
    }
    
    // Add a toggle button somewhere in the UI if needed
}

function playSound(soundName) {
    if (!soundsEnabled) return;
    
    const soundPath = sounds[soundName];
    if (!soundPath) return;
    
    const audio = new Audio(soundPath);
    audio.volume = 0.5; // Adjust volume as needed
    audio.play().catch(err => {
        console.warn('Could not play sound:', err);
    });
}

function toggleSounds() {
    soundsEnabled = !soundsEnabled;
    return soundsEnabled;
}

export { initSounds, playSound, toggleSounds };