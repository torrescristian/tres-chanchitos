import { Application, Point, Spritesheet } from "pixi.js";

import Block, { IBlockType } from "../molecules/Block";

interface IMatch3Params {
  size: number;
  blocks: IBlockType[];
  spritesheet: Spritesheet;
  app: Application;
}

interface ScoreEvent {
  points: number;
  matches: number[][];
  type: string;
  combo: number;
}

export default class Match3 {
  private board: Array<Array<Block | null>> = [];
  private readonly size: number;
  private readonly blocks: IBlockType[];
  private readonly spritesheet: Spritesheet;
  private readonly app: Application;
  public points: number = 0;
  public combo: number = 0;
  private onScoreChange?: (score: number, event: ScoreEvent) => void;

  constructor(params: IMatch3Params) {
    this.size = params.size;
    this.blocks = params.blocks;
    this.spritesheet = params.spritesheet;
    this.app = params.app;
    this.createBoard = this.createBoard.bind(this);
    this.createBlock = this.createBlock.bind(this);
    this.isValidPosition = this.isValidPosition.bind(this);
    this.handleSwap = this.handleSwap.bind(this);
    this.swapBlocks = this.swapBlocks.bind(this);
    this.revertInvalidSwap = this.revertInvalidSwap.bind(this);
    this.resolveMatches = this.resolveMatches.bind(this);
    this.findMatches = this.findMatches.bind(this);
    this.checkTriple = this.checkTriple.bind(this);
    this.getMatchSequence = this.getMatchSequence.bind(this);
    this.removeMatches = this.removeMatches.bind(this);
    this.dropNewBlocks = this.dropNewBlocks.bind(this);
    this.destroy = this.destroy.bind(this);
    this.calculateScore = this.calculateScore.bind(this);

    this.board = this.createBoard();
    this.resolveMatches();
  }

  public setScoreCallback(
    callback: (score: number, event: ScoreEvent) => void
  ) {
    this.onScoreChange = callback;
  }

  private createBoard(): Array<Array<Block | null>> {
    return Array.from({ length: this.size }, (_, y) =>
      Array.from({ length: this.size }, (_, x) => this.createBlock(x, y))
    );
  }

  private createBlock(x: number, y: number): Block {
    return new Block({
      app: this.app,
      spritesheet: this.spritesheet,
      type: this.getRandomBlockType(),
      gridX: x,
      gridY: y,
      onSwap: (pos, dir) => this.handleSwap(pos, dir),
      getAdjacentBlock: (gridX, gridY, dir) =>
        this.getAdjacentBlock(gridX, gridY, dir),
    });
  }

  private getRandomBlockType(): string {
    return this.blocks[Math.floor(Math.random() * this.blocks.length)];
  }

  private isValidPosition(pos: Point): boolean {
    // TODO: Validar de que en la nueva posición hace un match 3 valido
    return pos.x >= 0 && pos.y >= 0 && pos.x < this.size && pos.y < this.size;
  }

  private handleSwap(position: Point, direction: Point) {
    const targetPos = new Point(
      position.x + direction.x,
      position.y + direction.y
    );

    if (!this.isValidPosition(targetPos)) {
      this.revertInvalidSwap(position, targetPos);
      return;
    }

    const originalPos = position.clone();
    this.swapBlocks(position, targetPos);

    const matches = this.findMatches();
    if (matches.length === 0) {
      this.revertInvalidSwap(originalPos, targetPos);
    } else {
      this.resolveMatches();
    }
  }

  private swapBlocks(pos1: Point, pos2: Point) {
    const temp = this.board[pos1.y][pos1.x];
    this.board[pos1.y][pos1.x] = this.board[pos2.y][pos2.x];
    this.board[pos2.y][pos2.x] = temp;

    [this.board[pos1.y][pos1.x], this.board[pos2.y][pos2.x]].forEach(
      (block) => {
        if (block) {
          block.gridX = block === this.board[pos1.y][pos1.x] ? pos1.x : pos2.x;
          block.gridY = block === this.board[pos1.y][pos1.x] ? pos1.y : pos2.y;
        }
      }
    );
  }

  private revertInvalidSwap(originalPos: Point, targetPos: Point) {
    this.swapBlocks(originalPos, targetPos);

    [originalPos, targetPos].forEach((pos) => {
      const block = this.board[pos.y][pos.x];
      if (block) {
        block.animateToGridPosition(pos);
      }
    });
  }

  private resolveMatches() {
    const matches = this.findMatches();
    if (matches.length > 0) {
      this.combo++;
      this.removeMatches(matches);
      this.dropNewBlocks();
      setTimeout(() => this.resolveMatches(), 500);
    } else {
      this.combo = 0;
    }
  }

  private findMatches(): number[][] {
    const matches: number[][] = [];

    // Horizontal matches
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size - 2; x++) {
        if (this.checkTriple(x, y, 1, 0)) {
          matches.push(...this.getMatchSequence(x, y, 1, 0));
        }
      }
    }

    // Vertical matches
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size - 2; y++) {
        if (this.checkTriple(x, y, 0, 1)) {
          matches.push(...this.getMatchSequence(x, y, 0, 1));
        }
      }
    }

    return Array.from(
      new Set(matches.map((match) => JSON.stringify(match)))
    ).map((match) => JSON.parse(match));
  }

  private checkTriple(x: number, y: number, dx: number, dy: number): boolean {
    const current = this.board[y][x];
    const second = this.board[y + dy]?.[x + dx];
    const third = this.board[y + dy * 2]?.[x + dx * 2];

    return (
      !!current &&
      !!second &&
      !!third &&
      current.type === second.type &&
      current.type === third.type
    );
  }

  private getMatchSequence(
    x: number,
    y: number,
    dx: number,
    dy: number
  ): number[][] {
    const type = this.board[y][x]?.type;
    const sequence: number[][] = [];

    let currentX = x;
    let currentY = y;

    while (
      currentX >= 0 &&
      currentY >= 0 &&
      currentX < this.size &&
      currentY < this.size &&
      this.board[currentY][currentX]?.type === type
    ) {
      sequence.push([currentY, currentX]);
      currentX += dx;
      currentY += dy;
    }

    return sequence;
  }

  private removeMatches(matches: number[][]) {
    const uniqueMatches = Array.from(
      new Set(matches.map((match) => JSON.stringify(match)))
    ).map((matchStr) => JSON.parse(matchStr));

    // Calcular puntaje basado en la escala mejorada
    const scoreEvent = this.calculateScore(uniqueMatches);
    this.points += scoreEvent.points;

    // Notificar cambio de puntaje
    if (this.onScoreChange) {
      this.onScoreChange(this.points, scoreEvent);
    }

    uniqueMatches.forEach(([y, x]) => {
      this.board[y][x]?.destroy();
      this.board[y][x] = null;
    });
  }

  private calculateScore(matches: number[][]): ScoreEvent {
    let totalPoints = 0;
    const matchesByType: { [key: string]: number[][] } = {};

    // Agrupar matches por tipo de animal
    matches.forEach(([y, x]) => {
      const block = this.board[y]?.[x];
      if (block) {
        const type = block.type;
        if (!matchesByType[type]) {
          matchesByType[type] = [];
        }
        matchesByType[type].push([y, x]);
      }
    });

    let bestType = "";
    let maxMatches = 0;

    // Calcular puntos por cada tipo
    Object.entries(matchesByType).forEach(([type, typeMatches]) => {
      if (typeMatches.length > maxMatches) {
        maxMatches = typeMatches.length;
        bestType = type;
      }

      const basePoints = this.getAnimalPoints(type);
      const matchLength = typeMatches.length;

      // Escala de puntos por tamaño de combinación
      let multiplier = 1;
      if (matchLength >= 3 && matchLength <= 4) multiplier = 1;
      else if (matchLength >= 5 && matchLength <= 6) multiplier = 2;
      else if (matchLength >= 7 && matchLength <= 8) multiplier = 3;
      else if (matchLength >= 9) multiplier = 5;

      // Bonus por combo
      const comboBonus = this.combo > 1 ? Math.floor(this.combo * 0.5) : 0;

      const typePoints =
        basePoints * matchLength * multiplier + basePoints * comboBonus;
      totalPoints += typePoints;
    });

    return {
      points: totalPoints,
      matches,
      type: bestType,
      combo: this.combo,
    };
  }

  private getAnimalPoints(type: string): number {
    // Escala de puntos por tipo de animal (temática de "valor" del animal)
    const animalValues: { [key: string]: number } = {
      chick: 10, // Pollitos - básico
      pig: 15, // Chanchitos - protagonistas del juego
      parrot: 20, // Loros - coloridos
      crocodile: 25, // Cocodrilos - más raros
    };

    return animalValues[type] || 10;
  }

  public getScore(): number {
    return this.points;
  }

  public getCombo(): number {
    return this.combo;
  }

  private dropNewBlocks() {
    for (let x = 0; x < this.size; x++) {
      const newColumn: Block[] = [];

      // Collect existing blocks
      for (let y = this.size - 1; y >= 0; y--) {
        if (this.board[y][x]) {
          newColumn.unshift(this.board[y][x]!);
        }
      }

      // Fill empty slots with new blocks
      while (newColumn.length < this.size) {
        const newBlock = this.createBlock(x, newColumn.length - this.size - 1);
        newColumn.unshift(newBlock);
      }

      // Update board and animate
      newColumn.forEach((block, y) => {
        this.board[y][x] = block;
        block.animateToGridPosition(new Point(x, y));
      });
    }
  }

  private getAdjacentBlock(
    gridX: number,
    gridY: number,
    direction: Point
  ): Block | null {
    const targetX = gridX + direction.x;
    const targetY = gridY + direction.y;

    if (
      targetX < 0 ||
      targetY < 0 ||
      targetX >= this.size ||
      targetY >= this.size
    ) {
      return null;
    }

    return this.board[targetY][targetX];
  }

  public destroy() {
    this.board.forEach((row) =>
      row.forEach((block) => {
        block?.destroy();
      })
    );
    this.board = [];
  }

  public render() {
    this.board.forEach((row) =>
      row.forEach((block) => {
        block?.render();
      })
    );
  }
}
