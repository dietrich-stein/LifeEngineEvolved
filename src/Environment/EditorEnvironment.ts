import Environment from './Environment';
import Organism from '../Organism/Organism';
import GridMap from '../Grid/GridMap';
import Renderer from '../Rendering/Renderer';
import EditorController from '../Controllers/EditorController';
import RandomOrganismGenerator from '../Organism/RandomOrganismGenerator';
import Species from '../Stats/Species';
import CellStates from '../Anatomy/CellStates';
import Cell from '../Anatomy/Cell';

interface EditorEnvironmentInterface {
  renderer: Renderer;
  controller: EditorController;
  grid_map: GridMap;
  organism: Organism | null;
  is_active: boolean;
  update: () => void;
  changeCell: (c: number, r: number, state: any, gridMap: GridMap, ownerCell: Cell | null) => void;
  renderFull: () => void;
  addCellToOrg: (c: number, r: number, state: AnatomyCellStatesType) => void;
  removeCellFromOrg: (c: number, r: number) => void;
  setOrganismToCopyOf: (orig_org: Organism) => void;
  getCopyOfOrg: () => Organism | null;
  clear: () => void;
  setDefaultOrg: () => void;
  createRandom: () => void;
}

class EditorEnvironment extends Environment implements EditorEnvironmentInterface {
  renderer: Renderer;
  controller: EditorController;
  grid_map: GridMap;
  organism: Organism | null;
  is_active: boolean;

  constructor() {
    super();
    this.is_active = true;
    var cell_size = 13;
    this.renderer = new Renderer('editor-canvas', 'editor-env', false, cell_size);
    this.controller = new EditorController(this, this.renderer.canvas);
    this.grid_map = new GridMap(15, 15, cell_size);
    this.organism = null;
    this.setDefaultOrg();
  }

  update() {
    if (this.is_active) {
      this.renderer.renderHighlights();
    }
  }

  // @todo: We can do better than any here, circle back
  changeCell(c: number, r: number, state: any, gridMap: GridMap, ownerCell: Cell | null) {
    super.changeCell(c, r, state, gridMap, ownerCell);
    this.renderFull();
  }

  renderFull() {
    this.renderer.renderFullGrid(this.grid_map.grid);
  }

  // absolute c r, not local
  // @todo: We can do better than any here, circle back
  addCellToOrg(c: number, r: number, state: AnatomyCellStatesType) {
    if (this.organism === null) {
      return;
    }
    var center = this.grid_map.getCenter();
    var loc_c = c - center[0];
    var loc_r = r - center[1];
    var prev_cell = this.organism.anatomy.getLocalCell(loc_c, loc_r);
    if (prev_cell != null) {
      var new_cell = this.organism.anatomy.replaceCell(
        state,
        prev_cell.loc_col,
        prev_cell.loc_row,
        false,
        true,
      );
      this.changeCell(c, r, state, this.grid_map, new_cell);
    } else if (this.organism.anatomy.canAddCellAt(loc_c, loc_r)) {
      this.changeCell(
        c,
        r,
        state,
        this.grid_map,
        this.organism.anatomy.addDefaultCell(state, loc_c, loc_r, true),
      );
    }
    this.organism.species = new Species(this.organism.anatomy, null, 0);
  }

  removeCellFromOrg(c: number, r: number) {
    if (this.organism === null) {
      return;
    }    
    var center = this.grid_map.getCenter();
    var loc_c = c - center[0];
    var loc_r = r - center[1];
    if (loc_c == 0 && loc_r == 0) {
      alert('Cannot remove center cell');
      return;
    }
    var prev_cell = this.organism.anatomy.getLocalCell(loc_c, loc_r);
    if (prev_cell != null) {
      if (this.organism.anatomy.removeCell(loc_c, loc_r, false, true)) {
        this.changeCell(c, r, CellStates.empty, this.grid_map, null);
        this.organism.species = new Species(this.organism.anatomy, null, 0);
      }
    }
  }

  setOrganismToCopyOf(orig_org: Organism) {
    this.grid_map.fillGrid(CellStates.empty);
    var center = this.grid_map.getCenter();
    this.organism = new Organism(center[0], center[1], this, orig_org);
    this.organism.updateGrid();
    this.controller.updateDetails();
  }

  getCopyOfOrg() {
    if (this.organism === null) {
      return null;
    }
    var new_org = new Organism(0, 0, null, this.organism);
    return new_org;
  }

  clear() {
    this.grid_map.fillGrid(CellStates.empty);
  }

  setDefaultOrg() {
    this.clear();
    var center = this.grid_map.getCenter();
    this.organism = new Organism(center[0], center[1], this);
    this.organism.anatomy.addDefaultCell(CellStates.mouth, 0, 0, true);
    this.organism.updateGrid();
    this.organism.species = new Species(this.organism.anatomy, null, 0);
  }

  createRandom() {
    this.grid_map.fillGrid(CellStates.empty);

    this.organism = RandomOrganismGenerator.generate(this);
    this.organism.updateGrid();
    this.organism.species = new Species(this.organism.anatomy, null, 0);
  }
}

export default EditorEnvironment;
