import {
  Sprite,
  Point,
  Application,
  Spritesheet,
  FederatedPointerEvent,
} from "pixi.js";
import { Easing, Tween } from "@tweenjs/tween.js";

import { SPRITE_SIZE } from "../../../common/libs/consts";
import colorlog from "../../../common/libs/colorlog";
import { Howl } from "howler";

export const BlockTypes = ["chick", "crocodile", "parrot", "pig"] as const;

export type IBlockType = (typeof BlockTypes)[number];

interface BlockParams {
  app: Application;
  spritesheet: Spritesheet;
  type: string;
  gridX: number;
  gridY: number;
  onSwap: (position: Point, direction: Point) => void;
  getAdjacentBlock: (
    gridX: number,
    gridY: number,
    direction: Point
  ) => Block | null;
}

export default class Block {
  public sprite: Sprite;
  public gridX: number;
  public gridY: number;
  public readonly type: string;

  private tween: Tween;
  private isDragging = false;
  private readonly sound: Howl;

  private dragState: {
    startGrid: Point;
    originalPosition: Point;
    direction: Point | null;
    adjacentBlock: Block | null;
    adjacentOriginalPosition: Point | null;
    dragOffset: Point;
    currentDrag: number;
  } | null = null;

  constructor(private readonly params: BlockParams) {
    this.setupInteractions = this.setupInteractions.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.determineDragDirection = this.determineDragDirection.bind(this);
    this.destroy = this.destroy.bind(this);
    this.animateTo = this.animateTo.bind(this);
    this.gridToPixel = this.gridToPixel.bind(this);
    this.cleanupListeners = this.cleanupListeners.bind(this);
    this.commitSwap = this.commitSwap.bind(this);
    this.revertSwap = this.revertSwap.bind(this);
    this.revertToOriginalPosition = this.revertToOriginalPosition.bind(this);
    this.animateToGridPosition = this.animateToGridPosition.bind(this);

    this.gridX = params.gridX;
    this.gridY = params.gridY;
    this.type = params.type;

    // init sprite
    this.sprite = new Sprite(
      this.params.spritesheet.textures[`${this.type}.png`]
    );
    this.sprite.anchor.set(0.5);
    const position = this.gridToPixel(this.gridX, this.gridY);
    this.sprite.position.set(position.x, position.y);
    this.sprite.setSize(SPRITE_SIZE, SPRITE_SIZE);
    this.sprite.eventMode = "static";
    this.sprite.interactive = true;
    this.params.app.stage.addChild(this.sprite);
    // end init sprite
    this.tween = new Tween(this.sprite.position);
    this.setupInteractions();

    this.sound = new Howl({
      src: ["sound/die-throw-4.ogg"],
      // src: ["sound/chips-stack-4.ogg"],
      volume: 0.1,
    });
  }

  private setupInteractions() {
    this.sprite.on("pointerdown", this.startDrag);
  }

  private determineDragDirection(delta: Point) {
    if (!this.dragState) return;

    const threshold = SPRITE_SIZE * 0.05;
    const absDeltaX = Math.abs(delta.x);
    const absDeltaY = Math.abs(delta.y);

    if (absDeltaX > threshold || absDeltaY > threshold) {
      this.dragState.direction =
        absDeltaX > absDeltaY
          ? new Point(Math.sign(delta.x), 0)
          : new Point(0, Math.sign(delta.y));
    }
  }

  private startDrag(event: FederatedPointerEvent) {
    this.isDragging = true;

    const globalPos = new Point(event.globalX, event.globalY);
    const spritePos = this.sprite.getGlobalPosition();

    this.dragState = {
      startGrid: new Point(this.gridX, this.gridY),
      originalPosition: new Point(this.sprite.x, this.sprite.y),
      direction: null,
      adjacentBlock: null,
      adjacentOriginalPosition: null,
      dragOffset: new Point(
        globalPos.x - spritePos.x,
        globalPos.y - spritePos.y
      ),
      currentDrag: 0,
    };

    this.sprite.zIndex = 10;
    this.params.app.stage.interactive = true;
    this.params.app.stage.eventMode = "static";
    this.params.app.stage.on("pointermove", this.handleDrag);
    this.params.app.stage.on("pointerup", this.endDrag);
    this.params.app.stage.on("pointerupoutside", this.endDrag);
  }

  private async handleDrag(event: FederatedPointerEvent) {
    if (!this.isDragging || !this.dragState) return;

    const globalPos = new Point(event.globalX, event.globalY);
    const localPos = this.sprite.parent.toLocal(globalPos);
    const delta = new Point(
      localPos.x -
        this.dragState.dragOffset.x -
        this.dragState.originalPosition.x,
      localPos.y -
        this.dragState.dragOffset.y -
        this.dragState.originalPosition.y
    );

    if (!this.dragState.direction) {
      this.determineDragDirection(delta);
      this.findAdjacentBlock();
    }

    if (this.dragState.direction && this.dragState.adjacentBlock) {
      this.handleJointDrag(delta);
    } else {
      this.handleFreeDrag(localPos);
    }

    const confirmThreshold = SPRITE_SIZE * 0.3;
    if (Math.abs(this.dragState.currentDrag) >= confirmThreshold) {
      this.handleJointDrag(delta);
      this.endDrag();
    }
  }

  private handleJointDrag(delta: Point) {
    if (!this.dragState?.adjacentBlock || !this.dragState.direction) return;

    const axis = this.dragState.direction.x !== 0 ? "x" : "y";
    const dragAmount = Math.max(
      -SPRITE_SIZE,
      Math.min(delta[axis], SPRITE_SIZE)
    );

    // TODO: Si el bloque se mueve en la misma dirección pero sentido contrario
    // se debe cambiar el bloque adjacente
    this.sprite[axis] = this.dragState.originalPosition[axis] + dragAmount;
    this.dragState.adjacentBlock.sprite[axis] =
      this.dragState.adjacentOriginalPosition![axis] - dragAmount;

    this.dragState.currentDrag = dragAmount;
  }

  private handleFreeDrag(localPos: Point) {
    this.sprite.position.set(
      localPos.x - this.dragState!.dragOffset.x,
      localPos.y - this.dragState!.dragOffset.y
    );
  }

  private findAdjacentBlock() {
    if (!this.dragState?.direction) return;

    this.dragState.adjacentBlock = this.params.getAdjacentBlock(
      this.dragState.startGrid.x,
      this.dragState.startGrid.y,
      this.dragState.direction
    );

    if (this.dragState.adjacentBlock) {
      this.dragState.adjacentOriginalPosition = new Point(
        this.dragState.adjacentBlock.sprite.x,
        this.dragState.adjacentBlock.sprite.y
      );
    }
  }
  private async endDrag() {
    if (!this.dragState) return;

    this.isDragging = false;
    this.cleanupListeners();

    if (this.dragState.direction && this.dragState.adjacentBlock) {
      await this.handleSwapCompletion();
    } else {
      await this.revertToOriginalPosition();
    }

    this.dragState = null;
    this.sprite.zIndex = 0;
  }

  private async handleSwapCompletion() {
    if (!this.dragState?.adjacentBlock) return;

    const confirmThreshold = SPRITE_SIZE * 0.3;
    if (Math.abs(this.dragState.currentDrag) >= confirmThreshold) {
      await this.commitSwap();
    } else {
      await this.revertSwap();
    }
  }

  private async commitSwap() {
    if (!this.dragState?.adjacentBlock) return;

    [this.gridX, this.dragState.adjacentBlock.gridX] = [
      this.dragState.adjacentBlock.gridX,
      this.gridX,
    ];
    [this.gridY, this.dragState.adjacentBlock.gridY] = [
      this.dragState.adjacentBlock.gridY,
      this.gridY,
    ];

    // Animate to final positions
    await Promise.all([
      this.animateToGridPosition(this.getPoint()),
      this.dragState.adjacentBlock.animateToGridPosition(
        this.dragState.adjacentBlock.getPoint()
      ),
    ]);

    // Notify parent game
    this.params.onSwap(
      new Point(this.dragState.startGrid.x, this.dragState.startGrid.y),
      this.dragState.direction!
    );
  }

  private async revertSwap() {
    if (!this.dragState?.adjacentBlock) return;
    colorlog("revertSwap", "cyan");

    return Promise.all([
      this.animateTo(this.dragState.originalPosition),
      this.dragState.adjacentBlock.animateTo(
        this.dragState.adjacentOriginalPosition!
      ),
    ]);
  }

  private async revertToOriginalPosition() {
    await this.animateToGridPosition(this.getPoint());
  }

  public async animateToGridPosition(p: Point) {
    const position = this.gridToPixel(p.x, p.y);
    this.gridX = p.x;
    this.gridY = p.y;
    await this.animateTo(position);
  }

  private async animateTo(position: Point) {
    if (this.tween.isPlaying()) return;

    await new Promise((resolve) => {
      this.tween = new Tween(this.sprite.position)
        .to(position, 300)
        .easing(Easing.Quadratic.In)
        .onComplete(resolve)
        .start();
    });

    this.sound.play();
  }

  public getPoint() {
    return new Point(this.gridX, this.gridY);
  }

  private gridToPixel(x: number, y: number): Point {
    return new Point(
      x * SPRITE_SIZE + SPRITE_SIZE / 2,
      y * SPRITE_SIZE + SPRITE_SIZE / 2
    );
  }

  private cleanupListeners() {
    this.params.app.stage.off("pointermove", this.handleDrag);
    this.params.app.stage.off("pointerup", this.endDrag);
    this.params.app.stage.off("pointerupoutside", this.endDrag);
  }

  public destroy() {
    this.sprite.destroy();
    this.cleanupListeners();
  }

  public render() {
    this.tween.update();
  }
}
