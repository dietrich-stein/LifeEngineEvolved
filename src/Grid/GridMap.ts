import GridCell from './GridCell';
import CellStates from '../Anatomy/CellStates';
import Cell from '../Anatomy/Cell';

type SerializedCell = {
  c: number;
  r: number;
}

type SerializedGridMap = {
  cols: number;
  rows: number;
  food: Array<SerializedCell>;
  walls: Array<SerializedCell>;
};

interface GridMapInterface {
  grid: Array<Array<GridCell>>;
  cols: number;
  rows: number;
  cell_size: number;  
  resize: (cols: number, rows: number, cell_size: number) => void;
  fillGrid: (state: AllCellStatesType, ignore_walls: boolean) => void;
  cellAt: (col: number, row: number) => GridCell | null;
  setCellState: (col: number, row: number, state: AllCellStatesType) => void;
  setCellOwnerOrganism: (col: number, row: number, owner_cell: Cell) => void;
  isValidLoc: (col: number, row: number) => boolean;
  serialize: () => SerializedGridMap;
  loadRaw: (grid: SerializedGridMap) => void;
}

class GridMap implements GridMapInterface {
  grid: Array<Array<GridCell>>;
  cols: number;
  rows: number;
  cell_size: number;  
  
  constructor(cols: number, rows: number, cell_size: number) {
    this.grid = [];    
    this.cols = cols;
    this.rows = rows;
    this.cell_size = cell_size;    
    this.resize(cols, rows, cell_size);
  }

  resize(cols: number, rows: number, cell_size: number) {
    this.grid = [];
    this.cols = cols;
    this.rows = rows;
    this.cell_size = cell_size;
    for (var c = 0; c < cols; c++) {
      var row = [];
      for (var r = 0; r < rows; r++) {
        var cell = new GridCell(
          CellStates.empty,
          c,
          r,
          c * cell_size,
          r * cell_size,
        );
        row.push(cell);
      }
      this.grid.push(row);
    }
  }

  fillGrid(state: AllCellStatesType, ignore_walls: boolean = false) {
    for (var col of this.grid) {
      for (var cell of col) {
        if (ignore_walls && cell.state === CellStates.wall) {
          continue;
        }
        cell.setState(state);
        cell.owner_org = null;
        cell.owner_cell = null;
      }
    }
  }

  cellAt(col: number, row: number) {
    if (!this.isValidLoc(col, row)) {
      return null;
    }
    return this.grid[col][row];
  }

  setCellState(col: number, row: number, state: AllCellStatesType) {
    if (!this.isValidLoc(col, row)) {
      return;
    }
    this.grid[col][row].setState(state);
  }

  setCellOwnerOrganism(col: number, row: number, owner_cell: Cell) {
    if (!this.isValidLoc(col, row)) {
      return;
    }
    this.grid[col][row].owner_cell = owner_cell;
    if (owner_cell != null) {
      this.grid[col][row].owner_org = owner_cell.org;
    } else {
      this.grid[col][row].owner_org = null;
    }
  }

  isValidLoc(col: number, row: number) {
    return col < this.cols && row < this.rows && col >= 0 && row >= 0;
  }

  getCenter() {
    return [Math.floor(this.cols / 2), Math.floor(this.rows / 2)];
  }

  xyToColRow(x: number, y: number) {
    var c = Math.floor(x / this.cell_size);
    var r = Math.floor(y / this.cell_size);
    if (c >= this.cols) c = this.cols - 1;
    else if (c < 0) c = 0;
    if (r >= this.rows) r = this.rows - 1;
    else if (r < 0) r = 0;
    return [c, r];
  }

  serialize() {
    // Rather than store every single cell, we will store non organism cells (food+walls)
    // and assume everything else is empty. Organism cells will be set when the organism
    // list is loaded. This reduces filesize and complexity.
    let grid: SerializedGridMap = { 
      cols: this.cols, 
      rows: this.rows,
      food: [],
      walls: []
    };
    for (let col of this.grid) {
      for (let cell of col) {
        if (
          cell.state === CellStates.wall || 
          cell.state === CellStates.food
        ) {
          // no need to store state
          let c: SerializedCell = { 
            c: cell.col, 
            r: cell.row
          }; 
          if (cell.state === CellStates.food) {
            grid.food.push(c);
          } else {
            grid.walls.push(c);
          }
        }
      }
    }
    return grid;
  }

  // @todo: no any plz
  loadRaw(grid: SerializedGridMap) {
    for (let f of grid.food) {
      this.setCellState(f.c, f.r, CellStates.food);
    }
    for (let w of grid.walls) {
      this.setCellState(w.c, w.r, CellStates.wall);
    }
  }
}

export default GridMap;
