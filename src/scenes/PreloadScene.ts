import Phaser from "phaser";

// Scene to load all game assets
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    console.log("PreloadScene preload");

    // --- Load New Player Asset ---
    this.load.image(
      "player_man_blue",
      "assets/sprites/PNG/Robot 1/robot1_gun.png"
    );
    // ---------------------------

    this.load.image("hitman", "assets/sprites/PNG/Hitman 1/hitman1_gun.png");

    // --- Load Bullet Asset (Keep existing or update if needed) ---
    this.load.image("bullet", "assets/sprites/PNG/Tiles/tile_489.png"); // Using a weapon sprite as bullet
    // -----------------------------------------------------------

    // --- Load New Enemy Assets ---
    this.load.image(
      "enemy_zombie",
      "assets/sprites/PNG/Zombie 1/zombie1_gun.png"
    );
    this.load.image("enemy_robot", "assets/sprites/PNG/Robot 1/robot1_gun.png");
    this.load.image(
      "enemy_soldier",
      "assets/sprites/PNG/Soldier 1/soldier1_gun.png"
    );
    // ---------------------------

    // --- Load Explosion Spritesheet (Keep existing or update if needed) ---
    // IMPORTANT: Ensure 'explosion_sheet.png' exists in assets/sprites/ or update path/filename
    this.load.spritesheet("explosion", "assets/sprites/explosion_sheet.png", {
      frameWidth: 64, // Width of a single frame
      frameHeight: 64, // Height of a single frame
    });
    // ---------------------------------------------------------------------

    // Display a loading bar or text (optional)
    const loadingText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Loading...",
        { color: "#fff", fontSize: "24px" }
      )
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      // You can update a loading bar here based on 'value' (0 to 1)
      console.log("Loading progress:", value);
    });

    this.load.on("complete", () => {
      console.log("PreloadScene complete");
      loadingText.destroy();
      // Once loading is complete, start the main game scene
      this.scene.start("GameScene"); // Assuming you'll create a 'GameScene' next
    });
  }

  create() {
    // Preload scene usually doesn't need a create method unless setting up loading visuals
    console.log("PreloadScene create (should transition quickly)");
  }
}
