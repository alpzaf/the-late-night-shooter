import Phaser from "phaser";

// Simple Bullet class extending Arcade Sprite
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private lifespan: number = 1000; // How long the bullet lives in ms
  private timeCreated: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture
  ) {
    super(scene, x, y, texture);
    this.timeCreated = scene.time.now;
  }

  // Called by the group when the bullet is fired
  fire(x: number, y: number, angle: number, speed: number) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setAngle(Phaser.Math.RadToDeg(angle + Math.PI / 2)); // Adjust angle like the player

    // Calculate velocity based on angle and speed
    this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);

    this.timeCreated = this.scene.time.now; // Reset lifespan timer
  }

  // Pre-update check for lifespan
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (time - this.timeCreated > this.lifespan) {
      this.setActive(false);
      this.setVisible(false);
      this.body.stop(); // Stop physics simulation
    }
  }
}
