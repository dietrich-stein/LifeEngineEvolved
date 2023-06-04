import FossilRecord from '../Stats/FossilRecord';
import Environment from './Environment';
import Renderer from '../Rendering/Renderer';
import GridMap from '../Grid/GridMap';
import Organism from '../Organism/Organism';
import CellStates from '../Anatomy/CellStates';
import EnvironmentController from '../Controllers/EnvironmentController';
import Hyperparams from '../Hyperparams';
import WorldConfig from '../WorldConfig';
import SerializeHelper from '../Utils/SerializeHelper';
import Species from '../Stats/Species';
import Cell from '../Anatomy/Cell';
import GridCell from '../Grid/GridCell';

interface SpeciesMapInterface {
  [key: string]: Species;
}

interface WorldEnvironmentInterface {
  headless: boolean;
  fill_window: boolean;
  cell_size: number;
  num_cols: number;
  num_rows: number;
  num_random_orgs: number;
  renderer: Renderer;
  clear_walls_on_reset: boolean;
  auto_reset: boolean;
  brush_size: number;
  controller: EnvironmentController
  grid_map: GridMap;
  organisms: Array<Organism>;
  walls: Array<GridCell>;
  total_mutability: number;
  largest_cell_count: number;
  auto_reset_count: number;
  total_ticks: number;
  data_update_rate: number;
  fossil_record: FossilRecord;
  update: () => void;
  render: () => void;
  renderFull: () => void;
  removeOrganisms: (org_indeces: Array<string>) => void;
  OriginOfLife: () => void;
  addOrganism: (organism: Organism) => void;
  averageMutability: () => number;
  changeCell: (
    c: number, 
    r: number, 
    state: AllCellStatesType, 
    gridMap: GridMap, 
    ownerCell: Cell | null    
  ) => void;
  clearWalls: () => void;
  clearOrganisms: () => void;
  clearDeadOrganisms: () => void;
  generateFood: () => void;
  resetEnvironment: (confirm_reset: boolean, reset_life: boolean) => boolean;
  resetForSize: (
    cell_size: number,
    num_cols: number,
    num_rows: number,
    confirm_reset: boolean,
    reset_life: boolean
  ) => boolean;
  resetForWindow: (cell_size: number, confirm_reset: boolean, reset_life: boolean) => boolean;
  resetDenied: () => void;
  resetConfirm: () => boolean;
  resetAdditional: (reset_life: boolean) => void;
  resizeGridColRow: (cell_size: number, num_cols: number, num_rows: number) => void;
  resizeFillWindow: (cell_size: number) => void;
  serialize: () => any;
}

class WorldEnvironment extends Environment implements WorldEnvironmentInterface {
  headless: boolean;
  fill_window: boolean;
  cell_size: number;
  num_cols: number;
  num_rows: number;
  num_random_orgs: number;
  renderer: Renderer;
  clear_walls_on_reset: boolean;
  auto_reset: boolean;
  brush_size: number;
  controller: EnvironmentController
  grid_map: GridMap;
  organisms: Array<Organism>;
  walls: Array<GridCell>;
  total_mutability: number;
  largest_cell_count: number;
  auto_reset_count: number;
  total_ticks: number;
  data_update_rate: number;
  fossil_record: FossilRecord;

  constructor() {
    super();
    this.headless = WorldConfig.headless;
    this.fill_window = WorldConfig.fill_window;
    this.cell_size = WorldConfig.cell_size;
    this.num_cols = WorldConfig.num_cols;
    this.num_rows = WorldConfig.num_rows;
    this.num_random_orgs = WorldConfig.num_random_orgs;

    // For fill, the constructor resizes the canvas and updates the rows/cols
    this.renderer = new Renderer(
      'env-canvas',
      'env',
      this.fill_window,
      this.cell_size,
    );
    if (this.fill_window) {
      this.num_cols = this.renderer.num_cols;
      this.num_rows = this.renderer.num_rows;
    }

    this.clear_walls_on_reset = WorldConfig.clear_walls_on_reset;
    this.auto_reset = WorldConfig.auto_reset;
    this.brush_size = WorldConfig.brush_size;

    this.controller = new EnvironmentController(this, this.renderer);
    this.grid_map = new GridMap(this.num_cols, this.num_rows, this.cell_size);
    this.organisms = [];
    this.walls = [];
    this.total_mutability = 0;
    this.largest_cell_count = 0;
    this.auto_reset_count = 0;
    this.total_ticks = 0;
    this.data_update_rate = 100;
    this.fossil_record = new FossilRecord(this);
  }

  update() {
    var to_remove: Array<string> = [];
    for (var i in this.organisms) {
      var org = this.organisms[i];
      if (!org.living || !org.update()) {
        debugger; // what is i really?
        to_remove.push(i);
      }
    }
    this.removeOrganisms(to_remove);
    if (Hyperparams.foodDropProb > 0) {
      this.generateFood();
    }
    this.total_ticks++;
    if (this.total_ticks % this.data_update_rate == 0) {
      this.fossil_record.updateData();
    }
  }

  render() {
    if (this.headless) {
      this.renderer.cells_to_render.clear();
      return;
    }
    this.renderer.renderCells();
    this.renderer.renderHighlights();
  }

  renderFull() {
    this.renderer.renderFullGrid(this.grid_map.grid);
  }

  removeOrganisms(org_indeces: Array<string>) {
    let start_pop = this.organisms.length;
    for (var i of org_indeces.reverse()) {
      //@todo: uncomment this once i is known: this.total_mutability -= this.organisms[i].mutability;
      debugger; // now what is i?
      console.log(i); //this.organisms.splice(i, 1);
    }
    if (this.organisms.length === 0 && start_pop > 0) {
      if (this.auto_reset) {
        this.auto_reset_count++;
        this.resetEnvironment(false);
      } else {
        $('.pause-button')[0].click();
      }
    }
  }

  OriginOfLife() {
    var center = this.grid_map.getCenter();
    var org = new Organism(center[0], center[1], this);
    org.anatomy.addDefaultCell(CellStates.mouth, 0, 0, false);
    org.anatomy.addDefaultCell(CellStates.producer, 1, 1, false);
    org.anatomy.addDefaultCell(CellStates.producer, -1, -1, true);
    this.addOrganism(org);
    this.fossil_record.addSpecies(org, null);
  }

  addOrganism(organism: Organism) {
    organism.updateGrid();
    this.total_mutability += organism.mutability;
    this.organisms.push(organism);
    if (organism.anatomy.cells.length > this.largest_cell_count)
      this.largest_cell_count = organism.anatomy.cells.length;
  }

  averageMutability() {
    if (this.organisms.length < 1) return 0;
    if (Hyperparams.useGlobalMutability) {
      return Hyperparams.globalMutability;
    }
    return this.total_mutability / this.organisms.length;
  }

  changeCell(
    c: number, 
    r: number, 
    state: AllCellStatesType, 
    gridMap: GridMap, 
    ownerCell: Cell | null
  ) {
    super.changeCell(c, r, state, gridMap, ownerCell);
    let grid_cell = this.grid_map.cellAt(c, r);
    if (grid_cell === null) {
      return;
    }
    this.renderer.addToRender(grid_cell);
    if (state == CellStates.wall) {
      this.walls.push(grid_cell);
    }
  }

  clearWalls() {
    for (var wall of this.walls) {
      let wcell = this.grid_map.cellAt(wall.col, wall.row);
      if (wcell && wcell.state == CellStates.wall) {
        this.changeCell(wall.col, wall.row, CellStates.empty, this.grid_map, null);
      }
    }
  }

  clearOrganisms() {
    for (var org of this.organisms) {
      org.die();
    }
    this.organisms = [];
  }

  clearDeadOrganisms() {
    let to_remove = [];
    for (let i in this.organisms) {
      let org = this.organisms[i];
      if (!org.living) to_remove.push(i);
    }
    this.removeOrganisms(to_remove);
  }

  generateFood() {
    var num_food = Math.max(
      Math.floor(
        (this.grid_map.cols * this.grid_map.rows * Hyperparams.foodDropProb) /
          50000,
      ),
      1,
    );
    var prob = Hyperparams.foodDropProb;
    for (var i = 0; i < num_food; i++) {
      if (Math.random() <= prob) {
        var c = Math.floor(Math.random() * this.grid_map.cols);
        var r = Math.floor(Math.random() * this.grid_map.rows);
        var grid_cell = this.grid_map.cellAt(c, r);
        if (grid_cell !== null && grid_cell.state == CellStates.empty) {
          this.changeCell(c, r, CellStates.food, this.grid_map, null);
        }
      }
    }
  }

  resetEnvironment(confirm_reset: boolean = true, reset_life: boolean = true) {
    if (this.fill_window) {
      if (!this.resetForWindow(this.cell_size, confirm_reset, reset_life)) {
        this.resetDenied();
        return false;
      }
    } else {
      if (
        !this.resetForSize(
          this.cell_size,
          this.num_cols,
          this.num_rows,
          confirm_reset,
          reset_life,
        )
      ) {
        this.resetDenied();
        return false;
      }
    }
    return true;
  }

  resetForSize(
    cell_size: number,
    num_cols: number,
    num_rows: number,
    confirm_reset: boolean = true,
    reset_life: boolean = true,
  ) {
    if (confirm_reset && !this.resetConfirm()) return false;
    this.resizeGridColRow(cell_size, num_cols, num_rows);
    this.resetAdditional(reset_life);
    return true;
  }

  resetForWindow(cell_size: number, confirm_reset: boolean = true, reset_life: boolean = true) {
    if (confirm_reset && !this.resetConfirm()) return false;
    this.resizeFillWindow(cell_size);
    this.resetAdditional(reset_life);
    return true;
  }

  resetDenied() {
    // restores original values if prompt is denied
    this.fill_window = this.renderer.fill_window;
    this.cell_size = this.renderer.cell_size;
    this.num_cols = this.renderer.num_cols;
    this.num_rows = this.renderer.num_rows;
  }

  resetConfirm() {
    if (!confirm('The current environment will be lost. Proceed?')) {
      return false;
    }
    return true;
  }

  resetAdditional(reset_life: boolean = true) {
    this.organisms = [];
    this.grid_map.fillGrid(CellStates.empty, !this.clear_walls_on_reset);
    this.renderer.renderFullGrid(this.grid_map.grid);
    this.total_mutability = 0;
    this.total_ticks = 0;
    this.fossil_record.clear_record();
    if (reset_life) {
      this.OriginOfLife();
    }
  }

  resizeGridColRow(cell_size: number, num_cols: number, num_rows: number) {
    this.renderer.fill_window = false;
    this.renderer.cell_size = cell_size;
    this.renderer.num_cols = num_cols;
    this.renderer.num_rows = num_rows;

    let height = num_rows * cell_size;
    let width = num_cols * cell_size;

    this.renderer.fillShape(height - height * 0.2, width - width * 0.2);
    this.grid_map.resize(num_cols, num_rows, cell_size);
  }

  resizeFillWindow(cell_size: number) {
    this.renderer.fill_window = true;
    this.renderer.cell_size = cell_size;
    this.renderer.fillWindow('env');
    this.num_cols = this.renderer.num_cols = Math.ceil(
      this.renderer.width / cell_size,
    );
    this.num_rows = this.renderer.num_cols = Math.ceil(
      this.renderer.height / cell_size,
    );
    this.grid_map.resize(this.num_cols, this.num_rows, cell_size);
  }

  serialize() {
    this.clearDeadOrganisms();
    // @todo: fixme
    /*
    let env = SerializeHelper.copyNonObjects(this);
    env.grid = this.grid_map.serialize();
    env.organisms = [];
    for (let org of this.organisms) {
      env.organisms.push(org.serialize());
    }
    env.fossil_record = this.fossil_record.serialize();
    env.controls = Hyperparams;
    return env;
    */
    return {};
  }

  // @todo: json
  loadRaw(env: any) {
    // species name->stats map, evolution controls,
    this.organisms = [];
    this.fossil_record.clear_record();
    this.resizeGridColRow(
      this.grid_map.cell_size,
      env.grid.cols,
      env.grid.rows,
    );
    this.grid_map.loadRaw(env.grid);

    // create species map
    let species: SpeciesMapInterface = {};
    for (let name in env.fossil_record.species) {
      let s = new Species(null, null, 0);
      SerializeHelper.overwriteNonObjects(env.fossil_record.species[name], s);
      species[name] = s; // the species needs an anatomy obj still
    }

    for (let orgRaw of env.organisms) {
      let org = new Organism(orgRaw.col, orgRaw.row, this);
      org.loadRaw(orgRaw);
      this.addOrganism(org);
      let s = species[orgRaw.species_name];
      if (!s) {
        // ideally, every organisms species should exists, but there is a bug that misses some species sometimes
        s = new Species(org.anatomy, null, env.total_ticks);
        species[orgRaw.species_name] = s;
      }
      if (!s.anatomy) {
        //if the species doesn't have anatomy we need to initialize it
        s.anatomy = org.anatomy;
        s.calcAnatomyDetails();
      }
      org.species = s;
    }
    for (let name in species) {
      this.fossil_record.addSpeciesObj(species[name]);
    }
    this.fossil_record.loadRaw(env.fossil_record);
    SerializeHelper.overwriteNonObjects(env, this);
    if ($('#override-controls').is(':checked')) {
      Hyperparams.loadJsonObj(env.controls);
    }
    this.renderer.renderFullGrid(this.grid_map.grid);
  }
}

export default WorldEnvironment;
