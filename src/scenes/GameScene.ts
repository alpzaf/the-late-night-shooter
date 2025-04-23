import Phaser from "phaser";
import { Bullet } from "../entities/Bullet"; // Updated Bullet import path
import { gameEvents } from "../events/GameEvents"; // Updated GameEvents import path

// Type alias for GameObjects with Arcade Physics bodies
// Revert to Phaser.GameObjects.GameObject for broader compatibility with overlap callback
// type ArcadePhysicsCallbackObject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

// Define an interface for enemies with health
interface EnemyWithHealth extends Phaser.Physics.Arcade.Sprite {
  health: number;
}

// --- Main game scene ---
export class GameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  playerSpeed: number = 200;
  // Add properties for bullets and shooting timing
  bullets!: Phaser.Physics.Arcade.Group;
  bulletSpeed: number = 1000;
  lastFired: number = 0;
  fireRate: number = 250; // Milliseconds between shots

  // Add properties for enemies
  enemies!: Phaser.Physics.Arcade.Group;
  enemySpawnTimer!: Phaser.Time.TimerEvent;
  enemySpeed: number = 100;
  enemyMaxHealth: number = 2; // Max health for enemies

  // Add properties for health and score
  playerHealth: number = 100;
  score: number = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Assets should be preloaded in PreloadScene
  }

  create() {
    console.log("GameScene create");

    // --- Create Player ---
    // Get screen dimensions
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    // Create the player sprite with physics
    // IMPORTANT: Replace 'player_man_blue' if you used a different key in PreloadScene
    this.player = this.physics.add.sprite(
      screenCenterX,
      screenCenterY,
      "hitman"
    );

    // Optional: Scale the player if the asset is too big/small
    // this.player.setScale(0.5);

    // Optional: Prevent player from going off-screen
    this.player.setCollideWorldBounds(true);

    console.log("Player created");
    // ---------------------

    this.add.text(10, 10, "Game Scene - Player Added!", { color: "#fff" });

    // --- Create Bullet Group ---
    this.bullets = this.physics.add.group({
      defaultKey: "bullet", // Key for the bullet texture
      classType: Bullet, // Use our custom Bullet class
      maxSize: 2, // Maximum number of bullets allowed at once
      runChildUpdate: true, // Ensure preUpdate is called on children
    });
    console.log("Bullet group created");
    // -------------------------

    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group({
      // Set a default key, though spawnEnemy will override it
      defaultKey: "enemy_zombie",
      maxSize: 50,
      // Add createCallback to initialize health
      createCallback: (enemy) => {
        (enemy as EnemyWithHealth).health = this.enemyMaxHealth;
      },
    });
    console.log("Enemy group created");
    // -------------------------

    // --- Initialize Keyboard Input ---
    // Use non-null assertion (!) as keyboard is guaranteed to exist here
    this.cursors = this.input.keyboard!.createCursorKeys();
    console.log("Keyboard input initialized");
    // -------------------------------

    // --- Setup Mouse Input for Shooting ---
    // Add underscore to indicate pointer is intentionally unused in this specific callback implementation
    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer) => {
      // Check if enough time has passed since the last shot
      if (this.time.now > this.lastFired) {
        const bullet = this.bullets.get() as Bullet; // Get an inactive bullet

        if (bullet) {
          bullet.setScale(0.15); // Set scale explicitly here
          // Fire the bullet from the player's position and angle
          bullet.fire(
            this.player.x,
            this.player.y,
            this.player.rotation,
            this.bulletSpeed
          );
          // Update the last fired time
          this.lastFired = this.time.now + this.fireRate;
          // Optional: Play shoot sound
          // this.sound.play('shootSound');
        }
      }
    });
    console.log("Shooting input initialized");
    // -----------------------------------

    // --- Start Spawning Enemies ---
    // Spawn an enemy every 2 seconds (2000 ms)
    this.enemySpawnTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
    console.log("Enemy spawning started");
    // -----------------------------

    // --- Create Animations ---
    // Create explosion animation from the spritesheet
    // Check if animation already exists to prevent errors on scene restart

    if (!this.anims.exists("explode")) {
      console.warn("exist");

      this.anims.create({
        key: "explode", // Name of the animation
        // Adjust frame numbers if your sheet is different
        frames: this.anims.generateFrameNumbers("explosion", {
          start: 0,
          end: 15,
        }),
        frameRate: 20, // Frames per second
        repeat: 0, // Don't loop
        // hideOnComplete: true, // REMOVED: Rely solely on the destroy() call in the event listener
      });
      console.log("Explosion animation created");
    } else {
      console.log("Explosion animation already exists");
    }
    // -----------------------

    // --- Add Collision Detection ---
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.handleBulletEnemyCollision, // Pass the method directly
      undefined, // Optional process callback
      this // Context for the callback
    );
    // Add player/enemy collision
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision, // Pass the method directly
      undefined, // Optional process callback
      this // Context for the callback
    );
    console.log("Collision detection setup");
    // -----------------------------

    // --- Emit Initial State ---
    gameEvents.emit("scoreUpdated", this.score);
    gameEvents.emit("healthUpdated", this.playerHealth);
    // --------------------------
  }

  spawnEnemy() {
    // --- Choose Random Enemy Type ---
    const enemyTypes = ["enemy_zombie", "enemy_robot", "enemy_soldier"]; // Add keys of loaded enemies
    const randomType = Phaser.Utils.Array.GetRandom(enemyTypes);
    // ------------------------------

    const enemy = this.enemies.get(0, 0, randomType) as EnemyWithHealth; // Cast to EnemyWithHealth
    if (!enemy) {
      return; // No inactive enemies available in the pool
    }

    // Choose a random spawn position off-screen
    const edge = Phaser.Math.Between(0, 3);
    let spawnX = 0;
    let spawnY = 0;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const buffer = 50; // Spawn slightly off-screen

    switch (edge) {
      case 0: // Top edge
        spawnX = Phaser.Math.Between(0, width);
        spawnY = -buffer;
        break;
      case 1: // Right edge
        spawnX = width + buffer;
        spawnY = Phaser.Math.Between(0, height);
        break;
      case 2: // Bottom edge
        spawnX = Phaser.Math.Between(0, width);
        spawnY = height + buffer;
        break;
      case 3: // Left edge
        spawnX = -buffer;
        spawnY = Phaser.Math.Between(0, height);
        break;
    }

    enemy.enableBody(true, spawnX, spawnY, true, true);
    enemy.setTexture(randomType); // Ensure texture is set correctly when reusing
    // Reset health when reusing an enemy from the pool
    enemy.health = this.enemyMaxHealth;
    // Optional: Scale enemy if needed
    // enemy.setScale(0.8);

    // Make the enemy move towards the player
    this.physics.moveToObject(enemy, this.player, this.enemySpeed);

    console.log(
      `Enemy (${randomType}) spawned at ${spawnX.toFixed(0)}, ${spawnY.toFixed(
        0
      )}`
    );
  }

  handleBulletEnemyCollision(
    bulletGameObject: any, // Use 'any' to bypass strict type checking for overlap
    enemyGameObject: any // Use 'any' to bypass strict type checking for overlap
  ) {
    const bullet = bulletGameObject as Bullet; // Cast to Bullet
    const enemy = enemyGameObject as EnemyWithHealth; // Cast to EnemyWithHealth

    // --- Add stricter check: Exit immediately if either object is already inactive ---
    if (!bullet.active || !enemy.active) {
      return;
    }
    // -----------------------------------------------------------------------------

    // Deactivate bullet first
    bullet.setActive(false);
    bullet.setVisible(false);
    if (bullet.body instanceof Phaser.Physics.Arcade.Body) {
      bullet.body.stop();
    }

    // Reduce enemy health
    enemy.health -= 1;
    console.log(`Enemy hit! Health remaining: ${enemy.health}`);

    // Check if enemy health is depleted
    if (enemy.health <= 0) {
      // Deactivate enemy *now* that we know health is <= 0
      enemy.disableBody(true, true);

      // --- Explosion Removed ---
      // No explosion sprite or animation needed anymore
      // -----------------------

      // --- Update Score ---
      this.score += 10; // Increase score
      gameEvents.emit("scoreUpdated", this.score); // Emit score update event
      // --------------------

      console.log("Enemy destroyed!");
    } else {
      // Optional: Add visual feedback for enemy hit (e.g., tint)
      enemy.setTint(0xff0000); // Tint red
      this.time.delayedCall(100, () => {
        // Check if enemy still exists and is active *before* clearing tint
        if (enemy.active) {
          enemy.clearTint(); // Remove tint after a short delay
        }
      });
    }
  }

  // --- Add Player/Enemy Collision Handler ---
  handlePlayerEnemyCollision(
    _playerGameObject: any, // Use 'any' and underscore
    enemyGameObject: any // Use 'any'
  ) {
    // No need to cast playerGameObject if it's not used directly
    const enemy = enemyGameObject as Phaser.Physics.Arcade.Sprite;
    // const player = playerGameObject as Phaser.Physics.Arcade.Sprite; // Player variable is unused, remove or comment out

    // Simple damage model: deactivate enemy, reduce player health
    // Check if enemy is already inactive
    if (!enemy.active) return;
    enemy.disableBody(true, true); // Use disableBody to deactivate and hide

    this.playerHealth -= 25; // Decrease health
    // Ensure health doesn't go below 0 for display
    this.playerHealth = Math.max(0, this.playerHealth);
    // Check if scene is still active before emitting event
    if (!this.scene.isActive()) return;
    gameEvents.emit("healthUpdated", this.playerHealth); // Emit health update

    console.log(`Player hit by enemy! Health: ${this.playerHealth}`);

    // Optional: Add visual feedback (player flash)
    this.cameras.main.flash(100, 255, 0, 0); // Quick red flash

    // Check for game over
    if (this.playerHealth <= 0) {
      console.log("Game Over!");
      this.physics.pause(); // Pause physics
      this.enemySpawnTimer.paused = true; // Stop spawning enemies
      // Optional: Show a game over message or transition to a GameOverScene
      // Check if scene is still active before adding text
      if (!this.scene.isActive()) return;
      this.add
        .text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          "GAME OVER",
          {
            fontSize: "64px",
            color: "#ff0000",
            backgroundColor: "#000000",
          }
        )
        .setOrigin(0.5);
    }
  }
  // ----------------------------------------

  // Add underscores to indicate time and _delta are intentionally unused
  update(_time: number, _delta: number) {
    // Exit if player health is 0 or less
    if (this.playerHealth <= 0) {
      return;
    }

    // --- Handle Player Movement ---
    // Ensure player and its body exist before manipulating velocity
    if (!this.player || !this.player.body) {
      return; // Exit update loop if player or body is not ready
    }

    // Stop previous movement
    this.player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    // Use non-null assertion (!) for keyboard
    const keyboard = this.input.keyboard!;

    // Check keyboard input (using CursorKeys mapping and specific keys)
    if (
      this.cursors.left?.isDown ||
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown
    ) {
      moveX = -1;
    }
    if (
      this.cursors.right?.isDown ||
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown
    ) {
      moveX = 1;
    }
    if (
      this.cursors.up?.isDown ||
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown
    ) {
      moveY = -1;
    }
    if (
      this.cursors.down?.isDown ||
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown
    ) {
      moveY = 1;
    }

    // Apply velocity
    this.player.setVelocityX(moveX * this.playerSpeed);
    this.player.setVelocityY(moveY * this.playerSpeed);

    // Normalize speed for diagonal movement - Ensure body is Arcade Body for velocity access
    if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
      this.player.body.velocity
        .normalize()
        .scale(this.playerSpeed * (moveX !== 0 || moveY !== 0 ? 1 : 0));
    }
    // ----------------------------

    // --- Handle Player Aiming ---
    // Get mouse pointer coordinates relative to the world
    const pointer = this.input.activePointer;

    // Calculate the angle between the player and the pointer
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // Set the player's rotation directly
    this.player.setRotation(angle);
    // ---------------------------

    // --- Enemy Rotation (Optional) ---
    // Make enemies face the direction they are moving
    this.enemies.getChildren().forEach((enemy) => {
      const sprite = enemy as Phaser.Physics.Arcade.Sprite;
      // Check if sprite and its body exist and are active
      if (
        sprite &&
        sprite.active &&
        sprite.body &&
        sprite.body.velocity.lengthSq() > 0
      ) {
        // Check if active and moving
        sprite.rotation = sprite.body.velocity.angle(); // Adjust offset like player
      }
    });
    // --------------------------------
  }
}
