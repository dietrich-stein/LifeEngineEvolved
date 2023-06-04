import CellStates from '../CellStates';
import Cell from '../Cell';
import Organism from '../../Organism/Organism';

class ArmorCell extends Cell {
  constructor(org: Organism, loc_col: number, loc_row: number) {
    super(CellStates.armor, org, loc_col, loc_row);
  }
}

export default ArmorCell;
