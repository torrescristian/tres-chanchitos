import { Application, Point, Spritesheet } from "pixi.js";
import Block, { IBlockType } from "../molecules/Block";
import { SPRITE_SIZE } from "../../../common/libs/consts";

export default class Match3 {
  size: number = 8;
  blocks: IBlockType[];
  board: Array<Array<Block | null>>;
  spritesheet: Spritesheet;
  app: Application;

  constructor(options: {
    size: number;
    blocks: IBlockType[];
    spritesheet: Spritesheet;
    app: Application;
  }) {
    this.size = options.size;
    this.blocks = options.blocks;
    this.spritesheet = options.spritesheet;
    this.app = options.app;
    this.board = this.generateBoard();
    this.board.forEach((row, y) => {
      if (!row) return;

      row.forEach((block, x) => {
        if (block) {
          block.onClick(() => {
            if (!row[x] || !row[x + 1]) return;

            this.swapPieces(new Point(x, y), new Point(x + 1, y + 1));
            row[x]!.moveTo(row[x + 1]!.x, row[x + 1]!.y);
            row[x + 1]!.moveTo(row[x]!.x, row[x]!.y);
            this.findMatches();
          });
        }
      });
    });
  }

  generateBoard() {
    return Array.from({ length: this.size }, (_, x) =>
      Array.from({ length: this.size }, (_, y) => this.getRandomBlock(x, y))
    );
  }

  getRandomBlock(x: number, y: number): Block {
    return new Block({
      x: x * SPRITE_SIZE + SPRITE_SIZE / 2,
      y: y * SPRITE_SIZE + SPRITE_SIZE / 2,
      spritesheet: this.spritesheet,
      app: this.app,
      type: this.blocks[Math.floor(Math.random() * this.blocks.length)],
    });
  }

  findMatches() {
    const matches = [];

    // Buscar en filas
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size - 2; x++) {
        if (
          this.board &&
          this.board[y][x]?.type === this.board[y][x + 1]?.type &&
          this.board[y][x]?.type === this.board[y][x + 2]?.type
        ) {
          matches.push([y, x], [y, x + 1], [y, x + 2]);
        }
      }
    }

    // Buscar en columnas
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size - 2; y++) {
        if (
          this.board &&
          this.board[y][x]?.type === this.board[y + 1][x]?.type &&
          this.board[y][x]?.type === this.board[y + 2][x]?.type
        ) {
          matches.push([y, x], [y + 1, x], [y + 2, x]);
        }
      }
    }

    // return [...new Set(matches.map(JSON.stringify))].map(JSON.parse);
    return matches;
  }

  removeMatches() {
    let matches = this.findMatches();
    matches.forEach(([y, x]) => {
      if (!this.board) return;

      this.board[y][x] = null;
    });
    this.dropPieces();
  }

  dropPieces() {
    const notNull = (cell: any) => cell !== null;

    for (let x = 0; x < this.size; x++) {
      let nonEmptyCellsInRowX = this.board.map((row) => row[x]).filter(notNull);

      while (nonEmptyCellsInRowX.length < this.size) {
        nonEmptyCellsInRowX = [
          // FIXME: el y no debería ser 1, debería ser el número de fila
          this.getRandomBlock(1, x),
          ...nonEmptyCellsInRowX,
        ];
      }

      for (let y = 0; y < this.size; y++) {
        this.board[y][x] = nonEmptyCellsInRowX[y];
      }
    }
  }

  swapPieces(p1: Point, p2: Point) {
    console.log("swapPieces", p1, p2);
    [this.board[p1.y][p1.x], this.board[p2.y][p2.x]] = [
      this.board[p2.y][p2.x],
      this.board[p1.y][p1.x],
    ];
    // this.findMatches();
  }

  render() {
    this.board.forEach((row) => {
      row.forEach((cell) => {
        if (cell) {
          cell.render();
        }
      });
    });
  }
}

// Ejemplo de uso
// const game = new Match3();
// game.render();
// game.removeMatches();
// console.log("\nDespués de eliminar matches:");
// game.render();
