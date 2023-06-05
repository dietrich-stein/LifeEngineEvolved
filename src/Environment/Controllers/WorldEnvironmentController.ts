import EnvironmentController from './EnvironmentController';
import Organism from '../../Organism/Organism';
import ControlModes from '../../Interaction/ControlModes';
import CellStates from '../../Anatomy/CellStates';
import Neighbors from '../../Grid/Neighbors';
import WorldConfig from '../../WorldConfig';
import Perlin from '../../Utils/Perlin';
import Renderer from '../../Rendering/Renderer';
import { isWorldEnvironment } from '../../Utils/TypeHelpers';

interface WorldEnvironmentControllerInterface {
  mode: number;
  org_to_clone: Organism | null;
  scale: number;
  defineZoomControls: () => void;
  resetView: () => void;
  randomizeWalls: (thickness: number) => void;
  updateMouseLocation: (offsetX: number, offsetY: number) => void;
  mouseMove: () => void;
  mouseDown: () => void;
  mouseUp: () => void;
  performModeAction: () => void;
  dragScreen: () => void;
  dropOrganism: (organism: Organism, col: number, row: number) => boolean;
  dropCellType: (col: number, row: number, state: AllCellStatesType, killBlocking: boolean, ignoreState: AnatomyCellStatesType | null) => void;
  findNearOrganism: () => Organism | null;
  killNearOrganisms: () => void;
}

class WorldEnvironmentController extends EnvironmentController implements WorldEnvironmentControllerInterface {
  mode: number;
  org_to_clone: Organism | null;
  scale: number;
  perlin: Perlin;

  constructor(env: AnyEnvironmentType, renderer: Renderer) {
    super(env, renderer);
    this.mode = ControlModes.FoodDrop;
    this.org_to_clone = null;
    this.defineZoomControls();
    this.scale = 1;
    this.perlin = new Perlin();
  }

  defineZoomControls() {
    var scale = 1;
    var zoom_speed = 0.5;
    const el = <HTMLCanvasElement> document.querySelector('#env-canvas');
    if (el === null) {
      return;
    }
    const self = this;
    el.onwheel = (event: WheelEvent) => {
      event.preventDefault();

      if (self.canvas == null) {
        return;
      }

      var sign = -Math.sign(event.deltaY);

      // Restrict scale
      scale = Math.max(0.5, self.scale + sign * zoom_speed);

      var cur_top = parseInt($('#env-canvas').css('top'));
      var cur_left = parseInt($('#env-canvas').css('left'));

      var diff_x =
        (self.canvas.width / 2 - this.mouse_x) * (scale - this.scale);
      var diff_y =
        (self.canvas.height / 2 - this.mouse_y) * (scale - this.scale);

      $('#env-canvas').css('top', cur_top + diff_y + 'px');
      $('#env-canvas').css('left', cur_left + diff_x + 'px');

      // Apply scale transform
      el.style.transform = `scale(${scale})`;
      this.scale = scale;
    };
  }

  resetView() {
    $('#env-canvas').css('transform', 'scale(1)');
    $('#env-canvas').css('top', '0px');
    $('#env-canvas').css('left', '0px');
    this.scale = 1;
  }

  /*
    Iterate over grid from 0,0 to env.num_cols,env.num_rows and create random walls using perlin noise to create a more organic shape.
    */
  randomizeWalls(thickness: number = 1) {
    if (this.env === null || !isWorldEnvironment(this.env)) {
      return;
    }
    const noise_threshold = -0.017;
    let avg_noise = 0;
    let resolution = 20;
    this.perlin.reset();

    for (let r = 0; r < this.env.num_rows; r++) {
      for (let c = 0; c < this.env.num_cols; c++) {
        let xval =
          (c / this.env.num_cols) *
          ((resolution / this.env.renderer.cell_size) *
            (this.env.num_cols / this.env.num_rows));
        let yval =
          (r / this.env.num_rows) *
          ((resolution / this.env.renderer.cell_size) *
            (this.env.num_rows / this.env.num_cols));
        let noise = this.perlin.get(xval, yval);
        avg_noise += noise / (this.env.num_rows * this.env.num_cols);
        if (
          noise > noise_threshold &&
          noise < noise_threshold + thickness / resolution
        ) {
          let cell = this.env.grid_map.cellAt(c, r);
          if (cell != null) {
            if (cell.owner_org != null) cell.owner_org.die();
            this.env.changeCell(c, r, CellStates.wall, this.env.grid_map, null);
          }
        }
      }
    }
  }

  updateMouseLocation(offsetX: number, offsetY: number) {
    super.updateMouseLocation(offsetX, offsetY);
  }

  mouseMove() {
    this.performModeAction();
  }

  mouseDown() {
    this.start_x = this.mouse_x;
    this.start_y = this.mouse_y;
    this.performModeAction();
  }

  mouseUp() {}

  performModeAction() {
    if (WorldConfig.headless && this.mode != ControlModes.Drag) {
      return;
    }
    var mode = this.mode;
    var right_click = this.right_click;
    var left_click = this.left_click;
    if (mode != ControlModes.None && (right_click || left_click)) {
      if (this.cur_cell === null) {
        return;
      }
      switch (mode) {
        case ControlModes.FoodDrop:
          if (left_click) {
            this.dropCellType(
              this.cur_cell.col,
              this.cur_cell.row,
              CellStates.food,
              false,
              CellStates.wall
            );
          } else if (right_click) {
            this.dropCellType(
              this.cur_cell.col,
              this.cur_cell.row,
              CellStates.empty,
              false,
              CellStates.wall,
            );
          }
          break;
        case ControlModes.WallDrop:
          if (left_click) {
            this.dropCellType(this.cur_cell.col, this.cur_cell.row, CellStates.wall, true);
          } else if (right_click) {
            this.dropCellType(
              this.cur_cell.col,
              this.cur_cell.row,
              CellStates.empty,
              false,
              CellStates.food,
            );
          }
          break;

        case ControlModes.ClickKill:
          this.killNearOrganisms();
          break;

        case ControlModes.Select:
          if (this.cur_org == null) {
            this.cur_org = this.findNearOrganism();
          }
          if (
            this.cur_org != null && 
            this.control_panel !== null && 
            this.env !== null
          ) {
            this.control_panel.setEditorOrganism(this.cur_org);
          }
          break;

        case ControlModes.Clone:
          if (this.org_to_clone != null) {
            this.dropOrganism(this.org_to_clone, this.mouse_c, this.mouse_r);
          }
          break;
        case ControlModes.Drag:
          this.dragScreen();
          break;
      }
    } else if (this.middle_click) {
      //drag on middle click
      this.dragScreen();
    }
  }

  dragScreen() {
    var cur_top = parseInt($('#env-canvas').css('top'), 10);
    var cur_left = parseInt($('#env-canvas').css('left'), 10);
    var new_top = cur_top + (this.mouse_y - this.start_y) * this.scale;
    var new_left = cur_left + (this.mouse_x - this.start_x) * this.scale;
    $('#env-canvas').css('top', new_top + 'px');
    $('#env-canvas').css('left', new_left + 'px');
  }

  dropOrganism(organism: Organism, col: number, row: number) {
    if (this.env === null || !isWorldEnvironment(this.env)) {
      return false;
    }
    // close the organism and drop it in the world
    var new_org = new Organism(col, row, this.env, organism);

    if (new_org.isClear(col, row) && new_org.species !== null) {
      let new_species = !this.env.fossil_record.speciesIsExtant(
        new_org.species.name,
      );
      if (new_org.species.extinct) {
        this.env.fossil_record.resurrect(new_org.species);
      } else if (new_species) {
        this.env.fossil_record.addSpeciesObj(new_org.species);
        new_org.species.start_tick = this.env.total_ticks;
        new_org.species.population = 0;
      }

      this.env.addOrganism(new_org);
      new_org.species.addPop();
      return true;
    }
    return false;
  }

  dropCellType(col: number, row: number, state: AllCellStatesType, killBlocking: boolean = false, ignoreState: AnatomyCellStatesType | null = null) {
    if (this.env === null) {
      return;
    }    
    for (var loc of Neighbors.inRange(WorldConfig.brush_size)) {
      var c = col + loc[0];
      var r = row + loc[1];

      var cell = this.env.grid_map.cellAt(c, r);
      if (cell == null) continue;
      if (killBlocking && cell.owner_org != null) {
        cell.owner_org.die();
      } else if (cell.owner_org != null) {
        continue;
      }
      if (ignoreState != null && cell.state == ignoreState) {
        continue;
      }
      this.env.changeCell(c, r, state, this.env.grid_map, null);
    }
  }

  findNearOrganism() {
    if (this.env === null || this.cur_cell === null) {
      return null;
    }
    let closest = null;
    let closest_dist = 100;
    for (let loc of Neighbors.inRange(WorldConfig.brush_size)) {
      let c = this.cur_cell.col + loc[0];
      let r = this.cur_cell.row + loc[1];
      let cell = this.env.grid_map.cellAt(c, r);
      let dist = Math.abs(loc[0]) + Math.abs(loc[1]);
      if (cell != null && cell.owner_org != null) {
        if (closest === null || dist < closest_dist) {
          closest = cell.owner_org;
          closest_dist = dist;
        }
      }
    }
    return closest;
  }

  killNearOrganisms() {
    if (this.env === null || this.cur_cell === null) {
      return null;
    }    
    for (var loc of Neighbors.inRange(WorldConfig.brush_size)) {
      var c = this.cur_cell.col + loc[0];
      var r = this.cur_cell.row + loc[1];
      var cell = this.env.grid_map.cellAt(c, r);
      if (cell != null && cell.owner_org != null) cell.owner_org.die();
    }
  }
}

export default WorldEnvironmentController;
