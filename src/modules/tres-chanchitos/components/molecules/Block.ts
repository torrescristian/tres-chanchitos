import { Application, Point, Sprite, Spritesheet } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import { SPRITE_SIZE } from "../../../common/libs/consts";

export const BlockTypes = [
  "chick",
  "crocodile",
  // "monkey",
  "parrot",
  "pig",
] as const;

export type IBlockType = (typeof BlockTypes)[number];

type IConstructor = {
  x: number;
  y: number;
  spritesheet: Spritesheet;
  app: Application;
  type: IBlockType;
};

export default class Block {
  app: Application;
  spritesheet: Spritesheet;
  tween: Tween;
  sprite: Sprite;
  isDragging = false;
  offset = { x: 0, y: 0 };
  public width: number = SPRITE_SIZE;
  public height: number = SPRITE_SIZE;
  public type: string;

  constructor(options: IConstructor) {
    // VARS
    this.app = options.app;
    this.spritesheet = options.spritesheet;
    this.type = options.type;
    this.moveTo = this.moveTo.bind(this);
    this.render = this.render.bind(this);

    // SET UP
    this.sprite = new Sprite(this.spritesheet.textures[`${this.type}.png`]);
    this.sprite.anchor.set(0.5);
    this.sprite.setSize(this.width, this.height);
    this.sprite.x = options.x;
    this.sprite.y = options.y;
    this.sprite.interactive = true;
    this.tween = new Tween(this.sprite.position);

    // EVENTS
    this.sprite.on("pointerdown", (event) => {
      this.isDragging = true;
      // Capture initial global positions
      const startGlobal = event.global.clone();
      const spriteGlobal = this.sprite.getGlobalPosition();
      this.offset = {
        x: startGlobal.x - spriteGlobal.x,
        y: startGlobal.y - spriteGlobal.y,
      };
      this.app.stage.on("pointermove", (e) => {
        if (!this.isDragging) return;
        // Calculate new global position with offset
        const currentGlobal = e.global;
        const targetGlobal = {
          x: currentGlobal.x - this.offset.x,
          y: currentGlobal.y - this.offset.y,
        };
        // Convert global coordinates to parent's local space
        const targetPosition = this.sprite.parent.toLocal(
          new Point(targetGlobal.x, targetGlobal.y)
        );
        this.sprite.x = targetPosition.x;
        this.sprite.y = targetPosition.y;
      });
      this.app.stage.on("pointerup", () => {
        this.isDragging = false;
        this.app.stage.off("pointermove");
        this.app.stage.off("pointerup");
      });
    });
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    // ADD TO STAGE
    this.app.stage.addChild(this.sprite);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  moveTo(x: number, y: number) {
    if (this.tween.isPlaying()) return;

    this.tween
      .to({ x, y }, 1000)
      .easing(Easing.Quadratic.Out) // función de easing
      .start();
  }

  onClick(callback: () => void) {
    this.sprite.on("pointerdown", callback);
  }

  render() {
    this.tween.update();
  }
}
