import CellStates from '../CellStates';
import Cell from '../Cell';
import Hyperparams from '../../Hyperparams';
import Directions from '../../Organism/Directions';
import Observation from '../../Organism/Perception/Observation';
import Organism from '../../Organism/Organism';

class EyeCell extends Cell {
  direction: number;

  constructor(org: Organism, loc_col: number, loc_row: number) {
    super(CellStates.eye, org, loc_col, loc_row);
    this.org.anatomy.has_eye = true;
    this.direction = Directions.cardinals.n;
  }

  initInherit(parent: EyeCell) {
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
    this.direction = Directions.cardinals.n;
  }

  performFunction() {
    // @todo: decide if there should be some eye-benefit without a brain
    if (this.org.anatomy.has_brain && this.org.brain !== null) {
      var obs = this.look();
      if (obs !== null) {
        this.org.brain.observe(obs);
      }
    }
  }

  look() {
    var env = this.org.env;
    if (env === null) {
      return null;
    }
    var lookDirection = this.org.getAbsoluteDirection();
    var addCol = 0;
    var addRow = 0;
    switch (lookDirection) {
      case Directions.cardinals.n:
        addRow = -1;
        break;
      case Directions.cardinals.ne:
        addRow = -1;
        addCol = 1;        
        break;
      case Directions.cardinals.e:
        addCol = 1;
        break;
      case Directions.cardinals.se:
        addRow = 1;
        addCol = 1;        
        break;        
      case Directions.cardinals.s:
        addRow = 1;
        break;
      case Directions.cardinals.sw:
        addRow = 1;
        addCol = -1;        
        break;
      case Directions.cardinals.w:
        addCol = -1;
        break;
      case Directions.cardinals.nw:
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
      if (cell === null) {
        continue; 
        // @todo: if this break before to force the final return then why?
        // a null cell is kinda pointless isn't it?
        // it would need last_cell for that purpose to be effective
      }
      if (cell.owner_org === this.org && Hyperparams.seeThroughSelf) {
        continue;
      }
      if (cell.state !== CellStates.empty) {
        var distance = Math.abs(start_col - col) + Math.abs(start_row - row);
        return new Observation(cell, distance, lookDirection);
      }
    }
    return null; //return new Observation(cell, Hyperparams.lookRange, lookDirection);
  }
}

export default EyeCell;
