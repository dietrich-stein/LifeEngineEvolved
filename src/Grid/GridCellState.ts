import GridCell from "./GridCell";

interface GridCellStateInterface {
  name: string;
  color: string;
  render: (ctx: CanvasRenderingContext2D, cell: GridCell, size: number) => void;
}

class GridCellState implements GridCellStateInterface {
  name: string;
  color: string;

  constructor(name: string) {
    this.name = name;
    this.color = 'black';
  }

  render(ctx: CanvasRenderingContext2D, cell: GridCell, size: number) {
    ctx.fillStyle = this.color;
    ctx.fillRect(cell.x, cell.y, size, size);
  }
}

export default GridCellState;