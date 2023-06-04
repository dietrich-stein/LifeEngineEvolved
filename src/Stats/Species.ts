import CellStates from '../Anatomy/CellStates';
import Anatomy from '../Anatomy/Anatomy';
import Organism from '../Organism/Organism';

interface CountArrayInterface {
  [key: string]: number;
} 

interface SpeciesInterface {
  anatomy: Anatomy | null;
  ancestor: Species | null; 
  population: number;
  cumulative_pop: number;
  start_tick: number;
  end_tick: number;
  name: string;
  extinct: boolean;
  cell_counts: CountArrayInterface;
  calcAnatomyDetails: () => void;
  addPop: () => void;
  lifespan: () => number;
}

class Species implements SpeciesInterface {
  anatomy: Anatomy | null;
  ancestor: Species | null; 
  population: number;
  cumulative_pop: number;
  start_tick: number;
  end_tick: number;
  name: string;
  extinct: boolean;
  cell_counts: CountArrayInterface;
  
  constructor(anatomy: Anatomy | null, ancestor: Species | null, start_tick: number) {
    this.anatomy = anatomy;
    this.ancestor = ancestor;
    this.population = 1;
    this.cumulative_pop = 1;
    this.start_tick = start_tick;
    this.end_tick = -1;
    this.name = Math.random().toString(36).substring(2, 10);
    this.extinct = false;
    this.cell_counts = {};
    this.calcAnatomyDetails();
  }

  calcAnatomyDetails() {
    if (!this.anatomy) return;
    var new_cell_counts: CountArrayInterface = {};
    var living = CellStates.getLiving();
    for (let c of living) {
      new_cell_counts[c.name] = 0;
    }
    for (let cell of this.anatomy.cells) {
      new_cell_counts[cell.state.name] += 1;
    }
    this.cell_counts = new_cell_counts;
  }

  addPop() {
    this.population++;
    this.cumulative_pop++;
  }

  lifespan() {
    return this.end_tick - this.start_tick;
  }
}

export default Species;
