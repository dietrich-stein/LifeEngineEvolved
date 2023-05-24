import CellStates from '../CellStates';
import BodyCell from './BodyCell';

class MoverCell extends BodyCell {
  constructor(org, loc_col, loc_row) {
    super(CellStates.mover, org, loc_col, loc_row);
    this.org.anatomy.is_mover = true;
  }
}

export default MoverCell;
