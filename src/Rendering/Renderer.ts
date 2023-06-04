import GridCell from "../Grid/GridCell";
import Organism from "../Organism/Organism";

interface RendererInterface {
  fill_window: boolean;
  cell_size: number;
  num_cols: number;
  num_rows: number;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | undefined;
  height: number;
  width: number;
  cells_to_render: Set<GridCell>;
  cells_to_highlight: Set<GridCell>;
  highlighted_cells: Set<GridCell>;
}

// Renderer controls access to a canvas. There is one renderer for each canvas
class Renderer implements RendererInterface {
  fill_window: boolean;
  cell_size: number;
  num_cols: number;
  num_rows: number;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | undefined;
  height: number;
  width: number;
  cells_to_render: Set<GridCell>;
  cells_to_highlight: Set<GridCell>;
  highlighted_cells: Set<GridCell>;

  constructor(
    canvas_id: string,
    container_id: string,
    fill_window: boolean,
    cell_size: number,
    num_cols: number = 0,
    num_rows: number = 0,
  ) {
    this.fill_window = fill_window;
    this.cell_size = cell_size;
    this.num_cols = num_cols;
    this.num_rows = num_rows;

    this.canvas = <HTMLCanvasElement> document.getElementById(canvas_id);
    this.ctx = <CanvasRenderingContext2D> this.canvas.getContext('2d', {
      willReadFrequently: true,
    });

    if (this.fill_window) {
      this.fillWindow(container_id);
    }

    this.height = this.canvas.height;
    this.width = this.canvas.width;

    if (this.fill_window) {
      this.num_cols = Math.ceil(this.width / this.cell_size);
      this.num_rows = Math.ceil(this.height / this.cell_size);
    }

    this.cells_to_render = new Set();
    this.cells_to_highlight = new Set();
    this.highlighted_cells = new Set();
  }

  fillWindow(container_id: string) {
    const height = $('#' + container_id).height();
    const width = $('#' + container_id).width();

    if (typeof height !== 'undefined' && typeof width !== 'undefined') {
      this.fillShape(height, width);
    }
  }

  fillShape(height: number, width: number) {
    if (this.canvas === null) {
      return;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
  }

  clear() {
    if (typeof this.ctx === 'undefined') {
      return;
    }    
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.height, this.width);
  }

  renderFullGrid(grid: GridCell[][]) {
    for (var col of grid) {
      for (var cell of col) {
        this.renderCell(cell);
      }
    }
  }

  renderCells() {
    for (var cell of this.cells_to_render) {
      this.renderCell(cell);
    }
    this.cells_to_render.clear();
  }

  renderCell(cell: GridCell) {
    if (typeof this.ctx === 'undefined') {
      return;
    }     
    cell.state.render(this.ctx, cell, this.cell_size);
  }

  renderOrganism(org: Organism) {
    for (var org_cell of org.anatomy.cells) {
      var cell = org.getRealCell(org_cell);
      if (cell !== null) {
        this.renderCell(cell);
      }
    }
  }

  addToRender(cell: GridCell) {
    if (this.highlighted_cells.has(cell)) {
      this.cells_to_highlight.add(cell);
    }
    this.cells_to_render.add(cell);
  }

  renderHighlights() {
    for (var cell of this.cells_to_highlight) {
      this.renderCellHighlight(cell);
      this.highlighted_cells.add(cell);
    }
    this.cells_to_highlight.clear();
  }

  highlightOrganism(org: Organism) {
    for (var org_cell of org.anatomy.cells) {
      var cell = org.getRealCell(org_cell);
      if (cell !== null) {
        this.cells_to_highlight.add(cell);
      }
    }
  }

  highlightCell(cell: GridCell) {
    this.cells_to_highlight.add(cell);
  }

  renderCellHighlight(cell: GridCell, color: string = 'yellow') {
    this.renderCell(cell);
    if (typeof this.ctx === 'undefined') {
      return;
    }
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(cell.x, cell.y, this.cell_size, this.cell_size);
    this.ctx.globalAlpha = 1;
    this.highlighted_cells.add(cell);
  }

  clearAllHighlights(clear_to_highlight: boolean = false) {
    for (var cell of this.highlighted_cells) {
      this.renderCell(cell);
    }
    this.highlighted_cells.clear();
    if (clear_to_highlight) {
      this.cells_to_highlight.clear();
    }
  }
}

export default Renderer;
