import React from "react";
import "../styles/HUD.css"; // Updated CSS import path

interface HUDProps {
  score: number;
  health: number;
  // Add other relevant props like ammo, level, etc. later
}

const HUD: React.FC<HUDProps> = ({ score, health }) => {
  return (
    <div className="hud-container">
      <div className="hud-score">Score: {score}</div>
      <div className="hud-health">Health: {health}</div>
      {/* Add more UI elements here */}
    </div>
  );
};

export default HUD;
