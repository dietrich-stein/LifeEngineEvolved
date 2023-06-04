import CellStates from '../CellStates';
import Cell from '../Cell';
import Hyperparams from '../../Hyperparams';
import Organism from '../../Organism/Organism';
import GridCell from '../../Grid/GridCell';

class MouthCell extends Cell {
  constructor(org: Organism, loc_col: number, loc_row: number) {
    super(CellStates.mouth, org, loc_col, loc_row);
  }

  performFunction() {
    var env = this.org.env;
    if (env === null) {
      return;
    }
    var real_c = this.getRealCol();
    var real_r = this.getRealRow();
    for (var loc of Hyperparams.edibleNeighbors) {
      var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
      if (cell !== null) {
        this.eatNeighbor(cell, env);
      }
    }
  }

  eatNeighbor(n_cell: GridCell, env: AnyEnvironmentType) {
    if (n_cell == null) return;
    if (n_cell.state == CellStates.food) {
      env.changeCell(n_cell.col, n_cell.row, CellStates.empty, env.grid_map, null);
      this.org.food_collected++;
    }
  }
}

export default MouthCell;
