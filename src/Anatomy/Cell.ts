import GridCell from '../Grid/GridCell';
import Directions from '../Organism/Directions';
import Organism from '../Organism/Organism';

interface CellInterface {
  state: AnatomyCellStatesType;
  org: Organism;
  loc_col: number;
  loc_row: number;
  initInherit: (parent: Cell) => void;
  initRandom: () => void;
  initDefault: () => void;
  performFunction: () => void;
  getRealCol: () => void;
  getRealRow: () => void;
  getRealCell: () => GridCell | null;
  rotatedCol: (dir: number) => number;
  rotatedRow: (dir: number) => number;
}

class Cell implements CellInterface {
  state: AnatomyCellStatesType;
  org: Organism;
  loc_col: number;
  loc_row: number;

  constructor(state: AnatomyCellStatesType, org: Organism, loc_col: number, loc_row: number) {
    this.state = state;
    this.org = org;
    this.loc_col = loc_col;
    this.loc_row = loc_row;

    var distance = Math.max(
      Math.abs(loc_row) * 2 + 2,
      Math.abs(loc_col) * 2 + 2,
    );
    if (this.org.anatomy.birth_distance < distance) {
      this.org.anatomy.birth_distance = distance;
    }
  }

  initInherit(parent: Cell) {
    // deep copy parent values
    this.loc_col = parent.loc_col;
    this.loc_row = parent.loc_row;
  }

  initRandom() {
    // initialize values randomly
  }

  initDefault() {
    // initialize to default values
  }

  performFunction() {
    // default behavior: none
  }

  getRealCol() {
    return this.org.c + this.rotatedCol(this.org.rotation_direction);
  }

  getRealRow() {
    return this.org.r + this.rotatedRow(this.org.rotation_direction);
  }

  getRealCell() {
    var real_c = this.getRealCol();
    var real_r = this.getRealRow();
    if (this.org !== null && this.org.env !== null) {
      return this.org.env.grid_map.cellAt(real_c, real_r);
    } else {
      return null;
    }
  }

  rotatedCol(dir: number) {
    switch (dir) {
      case Directions.cardinals.n:
      case Directions.cardinals.ne:
      case Directions.cardinals.nw:
        return this.loc_col;

      case Directions.cardinals.s:
      case Directions.cardinals.se:
      case Directions.cardinals.sw:
        return this.loc_col * -1;

      case Directions.cardinals.e:
        return this.loc_row;

      case Directions.cardinals.w:
        return this.loc_row * -1;
      default:
        return dir;
    }
  }

  rotatedRow(dir: number) {
    switch (dir) {
      case Directions.cardinals.n:
        return this.loc_row;
      case Directions.cardinals.s:
        return this.loc_row * -1;

      case Directions.cardinals.w:
      case Directions.cardinals.nw:
      case Directions.cardinals.sw:
        return this.loc_col * -1;

      case Directions.cardinals.e:
      case Directions.cardinals.ne:
      case Directions.cardinals.nw:
        return this.loc_col;
      default:
        return dir;
    }
  }
}

export default Cell;
