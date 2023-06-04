import Cell from '../Anatomy/Cell';
import Organism from '../Organism/Organism';

interface GridCellInterface {
  state: AllCellStatesType;
  owner_org: Organism | null;
  owner_cell: Cell | null;
  col: number;
  row: number;
  x: number;
  y: number;
  setState: (state: AllCellStatesType) => void;
}

// A cell exists in a grid map.
class GridCell implements GridCellInterface {
  state: AllCellStatesType;
  owner_org: Organism | null;
  owner_cell: Cell | null;
  col: number;
  row: number;
  x: number;
  y: number;

  constructor(state: AllCellStatesType, col: number, row: number, x: number, y: number) {
    this.state = state;
    this.owner_org = null;
    this.owner_cell = null;
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
  }

  setState(state: AllCellStatesType) {
    this.state = state;
  }
}

export default GridCell;
