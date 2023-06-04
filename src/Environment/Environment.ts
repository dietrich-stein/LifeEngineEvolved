import GridMap from '../Grid/GridMap';
import Cell from '../Anatomy/Cell';

interface EnvironmentInterface {
  update: () => void;
  changeCell: (
    c: number, 
    r: number, 
    state: AllCellStatesType, 
    gridMap: GridMap, 
    ownerCell: Cell | null
  ) => void;
}

class Environment implements EnvironmentInterface {
  constructor() {
  }

  update() {
    alert('Environment.update() must be overriden');
  }

  changeCell(
    c: number, 
    r: number, 
    state: AllCellStatesType, 
    gridMap: GridMap, 
    ownerCell: Cell | null = null
  ) {
    gridMap.setCellState(c, r, state);
    if (ownerCell !== null) {
      gridMap.setCellOwnerOrganism(c, r, ownerCell);
    }
  }  
}

export default Environment;
