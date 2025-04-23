import Phaser from "phaser";

// Boot scene - minimal, just starts the PreloadScene
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    console.log("BootScene preload");
    // No assets needed here, just transition
  }

  create() {
    console.log("BootScene create - Starting PreloadScene");
    // Start the PreloadScene immediately
    this.scene.start("PreloadScene");
  }
}
