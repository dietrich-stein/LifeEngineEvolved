import Cell from './Cell';
import CellFactory from './CellFactory';
import CellStates from './CellStates';
import SerializeHelper from '../Utils/SerializeHelper';
import Organism from '../Organism/Organism';

type SerializedAnatomy = {};

interface AnatomyInterface {
  cells: Array<Cell>;
  owner_org: Organism;
  birth_distance: number;
  has_mouth: boolean;
  has_brain: boolean;
  has_mover: boolean;
  has_eye: boolean;
  has_killer: boolean;
  has_producer: boolean;
  has_armor: boolean;  
  mouth_count: number;
  brain_count: number;
  mover_count: number;
  eye_count: number;
  killer_count: number;
  producer_count: number;
  armor_count: number;  
  clear: () => void;
  canAddCellAt: (c: number, r: number) => boolean;
  addDefaultCell: (state: AnatomyCellStatesType, c: number, r: number, check_types: boolean) => Cell;
  addRandomizedCell: (state: AnatomyCellStatesType, c: number, r: number, check_types: boolean) => Cell;
  addInheritCell: (parent_cell: Cell, check_types: boolean) => Cell;
  replaceCell: (state: AnatomyCellStatesType, c: number, r: number, randomize: boolean, check_types: boolean) => Cell;
  removeCell: (c: number, r: number, allow_center_removal: boolean, check_types: boolean) => boolean;
  getLocalCell: (c: number, r: number) => Cell | null;
  checkTypeChange: () => void;
  getRandomCell: () => Cell;
  getNeighborsOfCell: (col: number, row: number) => Array<Cell>;
  isEqual: (anatomy: Anatomy) => boolean;
  serialize: () => SerializedAnatomy;
  loadRaw: (anatomy: Anatomy) => void;
}

class Anatomy implements AnatomyInterface {
  cells: Array<Cell>;
  owner_org: Organism;
  birth_distance: number;
  has_mouth: boolean;
  has_brain: boolean;
  has_mover: boolean;
  has_eye: boolean;
  has_killer: boolean;
  has_producer: boolean;
  has_armor: boolean;
  mouth_count: number;
  brain_count: number;
  mover_count: number;
  eye_count: number;
  killer_count: number;
  producer_count: number;
  armor_count: number;

  constructor(ownerOrganism: Organism) {
    this.cells = [];
    this.owner_org = ownerOrganism;
    this.birth_distance = 4;

    this.has_mouth = false;    
    this.has_brain = false;
    this.has_mover = false;
    this.has_eye = false;
    this.has_killer = false;
    this.has_producer = false;
    this.has_armor = false;

    this.mouth_count = 0;
    this.brain_count = 0;
    this.mover_count = 0;
    this.eye_count = 0;
    this.killer_count = 0;
    this.producer_count = 0;
    this.armor_count = 0;
  }

  clear() {
    this.cells = [];

    this.has_mouth = false;    
    this.has_brain = false;
    this.has_mover = false;
    this.has_eye = false;
    this.has_killer = false;
    this.has_producer = false;
    this.has_armor = false;

    this.mouth_count = 0;    
    this.brain_count = 0;
    this.mover_count = 0;
    this.eye_count = 0;
    this.killer_count = 0;
    this.producer_count = 0;
    this.armor_count = 0;
  }

  canAddCellAt(c: number, r: number) {
    for (var cell of this.cells) {
      if (cell.loc_col == c && cell.loc_row == r) {
        return false;
      }
    }
    return true;
  }

  addDefaultCell(state: AnatomyCellStatesType, c: number, r: number, check_types: boolean = false) {
    var new_cell = CellFactory.createDefault(this.owner_org, state, c, r);
    this.cells.push(new_cell);
    if (check_types) {
      this.checkTypeChange();
    }
    return new_cell;
  }

  addRandomizedCell(state: AnatomyCellStatesType, c: number, r: number, check_types: boolean = false) {
    var new_cell = CellFactory.createRandom(this.owner_org, state, c, r);
    this.cells.push(new_cell);
    // randomize decisions for first brain cell
    if (
      state == CellStates.brain && 
      this.has_brain &&
      this.owner_org.brain !== null
    ) {
      this.owner_org.brain.randomizeDecisions();
    }
    if (check_types) {
      this.checkTypeChange();
    }
    return new_cell;
  }

  addInheritCell(parent_cell: AnatomyCellStatesType, check_types: boolean = false) {
    var new_cell = CellFactory.createInherited(this.owner_org, parent_cell);
    this.cells.push(new_cell);
    if (check_types) {
      this.checkTypeChange();
    }
    return new_cell;
  }

  replaceCell(state: AnatomyCellStatesType, c: number, r: number, randomize: boolean = true, check_types: boolean = false) {
    // false because we don't want to check types until after the replacement
    this.removeCell(c, r, true, false);
    if (randomize) {
      return this.addRandomizedCell(state, c, r, check_types);
    } else {
      return this.addDefaultCell(state, c, r, check_types);
    }
  }

  removeCell(c: number, r: number, allow_center_removal: boolean = false, check_types: boolean = false) {
    if (c == 0 && r == 0 && !allow_center_removal) return false;
    for (var i = 0; i < this.cells.length; i++) {
      var cell = this.cells[i];
      if (cell.loc_col == c && cell.loc_row == r) {
        this.cells.splice(i, 1);
        break;
      }
    }
    if (check_types) {
      this.checkTypeChange();
    }
    return true;
  }

  getLocalCell(c: number, r: number) {
    for (var cell of this.cells) {
      if (cell.loc_col == c && cell.loc_row == r) {
        return cell;
      }
    }
    return null;
  }

  checkTypeChange() {
    this.has_mouth = false;
    this.has_brain = false;
    this.has_mover = false;
    this.has_eye = false;
    this.has_killer = false;
    this.has_producer = false;
    this.has_armor = false;
    for (var cell of this.cells) {
      // @todo: should be using a switch here
      if (cell.state == CellStates.mouth) {
        this.has_mouth = true;
        this.mouth_count++;
      }
      if (cell.state == CellStates.brain) {
        this.has_brain = true;
        this.brain_count++;
      }
      if (cell.state == CellStates.mover) {
        this.has_mover = true;
        this.mover_count++;
      }
      if (cell.state == CellStates.eye) {
        this.has_eye = true;
        this.eye_count++;
      }
      if (cell.state == CellStates.killer) {
        this.has_killer = true;
        this.killer_count++;
      }
      if (cell.state == CellStates.producer) {
        this.has_producer = true;
        this.producer_count++;
      }
      if (cell.state == CellStates.armor) {
        this.has_eye = true;
        this.armor_count++;
      }
    }
  }

  getRandomCell() {
    return this.cells[Math.floor(Math.random() * this.cells.length)];
  }

  getNeighborsOfCell(col: number, row: number) {
    var neighbors = [];
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        var neighbor = this.getLocalCell(col + x, row + y);
        if (neighbor !== null) {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  isEqual(anatomy: Anatomy) {
    // currently unused helper func. inefficient, avoid usage in prod.
    if (this.cells.length !== anatomy.cells.length) return false;
    for (let i in this.cells) {
      let my_cell = this.cells[i];
      let their_cell = anatomy.cells[i];
      if (
        my_cell.loc_col !== their_cell.loc_col ||
        my_cell.loc_row !== their_cell.loc_row ||
        my_cell.state !== their_cell.state
      )
        return false;
    }
    return true;
  }

  serialize() {
    let anatomy = <Anatomy> SerializeHelper.copyNonObjects(this);
    anatomy.cells = [];
    for (let cell of this.cells) {
      let newcell = <Cell> SerializeHelper.copyNonObjects(cell);
      newcell.state = { name: cell.state.name };
      anatomy.cells.push(newcell);
    }
    return anatomy;
  }

  loadRaw(anatomy: Anatomy) {
    this.clear();
    for (let cell of anatomy.cells) {
      this.addInheritCell(cell, false);
    }
    this.checkTypeChange();
  }
}

export default Anatomy;
