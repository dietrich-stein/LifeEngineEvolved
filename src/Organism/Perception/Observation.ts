import GridCell from "../../Grid/GridCell";

class Observation {
  cell: GridCell;
  distance: number;
  direction: number;

  constructor(cell: GridCell, distance: number, direction: number) {
    this.cell = cell;
    this.distance = distance;
    this.direction = direction;
  }
}

export default Observation;
