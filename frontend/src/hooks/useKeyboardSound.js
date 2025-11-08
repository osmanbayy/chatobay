const keyStrokeSounds = [
  new Audio("/sounds/keystroke1.mp3"),
  new Audio("/sounds/keystroke2.mp3"),
  new Audio("/sounds/keystroke3.mp3"),
  new Audio("/sounds/keystroke4.mp3"),
];

const useKeyboardSound = () => {
  const playRandomKeyStrokeSound = () => {
    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

    randomSound.currentTime = 0;  // this is for a better UX, def add this
    randomSound.play().catch(error => console.error("Audio play failed: ", error));
  }

  return { playRandomKeyStrokeSound }
}

export default useKeyboardSound;