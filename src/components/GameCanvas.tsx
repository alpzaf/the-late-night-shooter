import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene.ts"; // Import BootScene with extension
import { PreloadScene } from "../scenes/PreloadScene.ts"; // Import PreloadScene with extension
import { GameScene } from "../scenes/GameScene.ts"; // Import GameScene with extension

const GameCanvas: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1280, // Example: Changed from 800
        height: 720, // Example: Changed from 600
        parent: gameContainerRef.current,
        // Use the imported scenes
        scene: [BootScene, PreloadScene, GameScene], // BootScene will start first
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        backgroundColor: "#1a1a1a",
      };

      gameInstanceRef.current = new Phaser.Game(config);
      console.log("Phaser Game Initialized");
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
        console.log("Phaser Game Destroyed");
      }
    };
  }, []);

  return <div ref={gameContainerRef} id="phaser-game-container" />;
};

export default GameCanvas;
