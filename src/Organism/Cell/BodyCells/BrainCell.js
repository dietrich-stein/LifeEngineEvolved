import CellStates from '../CellStates';
import BodyCell from './BodyCell';

class BrainCell extends BodyCell {
  constructor(org, loc_col, loc_row) {
    super(CellStates.brain, org, loc_col, loc_row);
    this.org.anatomy.has_brain = true;
  }

  initInherit(parent) {
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
