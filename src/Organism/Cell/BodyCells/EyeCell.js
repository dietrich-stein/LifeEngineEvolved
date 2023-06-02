import CellStates from '../CellStates';
import BodyCell from './BodyCell';
import Hyperparams from '../../../Hyperparameters';
import Directions from '../../Directions';
import Observation from '../../Perception/Observation';

class EyeCell extends BodyCell {
  constructor(org, loc_col, loc_row) {
    super(CellStates.eye, org, loc_col, loc_row);
    this.org.anatomy.has_eye = true;
  }

  initInherit(parent) {
    // deep copy parent values
    super.initInherit(parent);
    this.direction = parent.direction;
  }

  initRandom() {
    // initialize values randomly
    this.direction = Directions.getRandomDirection();
  }

  initDefault() {
    // initialize to default values
    this.direction = Directions.n;
  }

  performFunction() {
    // @todo: decide if there should be some eye-benefit without a brain
    if (this.org.anatomy.has_brain) {
      var obs = this.look();
      this.org.brain.observe(obs);
    }
  }

  look() {
    var env = this.org.env;
    var lookDirection = Directions.getAbsoluteDirection(this);
    var addCol = 0;
    var addRow = 0;
    switch (lookDirection) {
      case Directions.n:
        addRow = -1;
        break;
      case Directions.ne:
        addRow = -1;
        addCol = 1;        
        break;
      case Directions.e:
        addCol = 1;
        break;
      case Directions.se:
        addRow = 1;
        addCol = 1;        
        break;        
      case Directions.s:
        addRow = 1;
        break;
      case Directions.sw:
        addRow = 1;
        addCol = -1;        
        break;
      case Directions.w:
        addCol = -1;
        break;
      case Directions.mw:
        addRow = -1;        
        addCol = -1;
        break;        
    }
    var start_col = this.getRealCol();
    var start_row = this.getRealRow();
    var col = start_col;
    var row = start_row;
    var cell = null;
    for (var i = 0; i < Hyperparams.lookRange; i++) {
      col += addCol;
      row += addRow;
      cell = env.grid_map.cellAt(col, row);
      if (cell == null) {
        break;
      }
      if (cell.owner === this.org && Hyperparams.seeThroughSelf) {
        continue;
      }
      if (cell.state !== CellStates.empty) {
        var distance = Math.abs(start_col - col) + Math.abs(start_row - row);
        return new Observation(cell, distance, lookDirection);
      }
    }
    return new Observation(cell, Hyperparams.lookRange, lookDirection);
  }
}

export default EyeCell;
