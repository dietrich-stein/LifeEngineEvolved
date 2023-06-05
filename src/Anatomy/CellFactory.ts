import Organism from '../Organism/Organism';
import MouthCell from './Cells/MouthCell';
import BrainCell from './Cells/BrainCell';
import ProducerCell from './Cells/ProducerCell';
import MoverCell from './Cells/MoverCell';
import KillerCell from './Cells/KillerCell';
import ArmorCell from './Cells/ArmorCell';
import EyeCell from './Cells/EyeCell';
import { 
  MouthState,
  BrainState,
  ProducerState,
  MoverState,
  KillerState,
  ArmorState,
  EyeState
} from './CellStates';

interface CellClassesInterface {
  [key: string]: typeof MouthCell | typeof BrainCell | typeof ProducerCell | typeof MoverCell | typeof KillerCell | typeof ArmorCell | typeof EyeCell;
}

type CellStatesType =
  | MouthState
  | BrainState
  | ProducerState
  | MoverState
  | KillerState
  | ArmorState
  | EyeState;

abstract class CellFactory {
  private static CellClasses: CellClassesInterface = {
    'mouth': MouthCell,
    'brain': BrainCell,
    'producer': ProducerCell,
    'mover': MoverCell,
    'killer': KillerCell,
    'armor': ArmorCell,
    'eye': EyeCell
  }

  public static createInherited(org: Organism, to_copy: AnatomyCellClassType) {
    var cellClass = CellFactory.CellClasses[to_copy.state.name];
    var cell = new cellClass(org, to_copy.loc_col, to_copy.loc_row);
    cell.initInherit(to_copy);
    return cell;
  }

  public static createRandom(org: Organism, state: CellStatesType, loc_col: number, loc_row: number) {
    var cellClass = CellFactory.CellClasses[state.name];
    var cell = new cellClass(org, loc_col, loc_row);    
    cell.initRandom();
    return cell;
  }

  public static createDefault(org: Organism, state: CellStatesType, loc_col: number, loc_row: number) {
    var cellClass = CellFactory.CellClasses[state.name];
    var cell = new cellClass(org, loc_col, loc_row);    
    cell.initDefault();
    return cell;
  }
}



export default CellFactory;
