import CellStates from '../CellStates';
import Cell from '../Cell';
import Organism from '../../Organism/Organism';

class BrainCell extends Cell {
  constructor(org: Organism, loc_col: number, loc_row: number) {
    super(CellStates.brain, org, loc_col, loc_row);
    this.org.anatomy.has_brain = true;
  }

  initInherit(parent: Cell) {
    // deep copy parent values
    super.initInherit(parent);
  }

  initRandom() {
    // initialize values randomly
  }

  initDefault() {
    // initialize to default values
  }
}

export default BrainCell;
