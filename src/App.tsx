import { useEffect, useState } from "react";
import "./styles/App.css"; // Updated CSS import path
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD"; // Import the HUD
import { gameEvents } from "./events/GameEvents";

function App() {
  // State to hold game data for the HUD
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100); // Example starting health

  useEffect(() => {
    // Listener for score updates from the game
    const handleScoreUpdate = (newScore: number) => {
      setScore(newScore);
    };
    gameEvents.on("scoreUpdated", handleScoreUpdate);

    // Listener for health updates from the game
    const handleHealthUpdate = (newHealth: number) => {
      setHealth(newHealth);
    };
    gameEvents.on("healthUpdated", handleHealthUpdate);

    // Cleanup listeners when the App component unmounts
    return () => {
      gameEvents.off("scoreUpdated", handleScoreUpdate);
      gameEvents.off("healthUpdated", handleHealthUpdate);
    };
  }, []); // Empty dependency array ensures listeners are set up once

  return (
    <div className="app-container">
      {" "}
      {/* Added a container for positioning */}
      <HUD score={score} health={health} />
      {/* Pass event emitter or callbacks to GameCanvas if needed,
          but for now, we use a shared event emitter */}
      <GameCanvas />
    </div>
  );
}

export default App;
