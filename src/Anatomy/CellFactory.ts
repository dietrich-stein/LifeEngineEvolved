//import BrainCell from './AnatomyCells/BrainCell';
import Organism from '../Organism/Organism';
import MouthCell from './Cells/MouthCell';
//import ProducerCell from './AnatomyCells/ProducerCell';
//import MoverCell from './AnatomyCells/MoverCell';
//import KillerCell from './AnatomyCells/KillerCell';
//import ArmorCell from './AnatomyCells/ArmorCell';
//import EyeCell from './AnatomyCells/EyeCell';
import { MouthState } from './CellStates';
//import CellStates from './CellStates';

type CellType = MouthCell;
type CellStatesType = MouthState;

class CellFactory {
  public static createInherited(org: Organism, to_copy: CellType) {
    //var cell = new this.type_map[to_copy.state.name as keyof TypeMapInterface](
    var cell = new (<any>window)[to_copy.state.name](
      org, 
      to_copy.loc_col, 
      to_copy.loc_row
    );
    cell.initInherit(to_copy);
    return cell;
  }

  public static createRandom(org: Organism, state: CellStatesType, loc_col: number, loc_row: number) {
    //var cell = new this.type_map[state.name as keyof TypeMapInterface](org, loc_col, loc_row);
    var cell = new (<any>window)[state.name](org, loc_col, loc_row);
    cell.initRandom();
    return cell;
  }

  public static createDefault(org: Organism, state: CellStatesType, loc_col: number, loc_row: number) {
    //var cell = new this.type_map[state.name as keyof TypeMapInterface](org, loc_col, loc_row);
    var cell = new (<any>window)[state.name](org, loc_col, loc_row);
    cell.initDefault();
    return cell;
  }
}



export default CellFactory;
