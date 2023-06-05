import GridCell from "../../Grid/GridCell";
import Organism from "../../Organism/Organism";
import Renderer from "../../Rendering/Renderer";
import ControlPanel from "../../Interaction/ControlPanel";

class EnvironmentController {
  env: AnyEnvironmentType | null;
  control_panel: ControlPanel | null;
  canvas: HTMLCanvasElement | null;
  mouse_x: number;
  mouse_y: number;
  mouse_c: number;
  mouse_r: number;
  left_click: boolean;
  middle_click: boolean;
  right_click: boolean;
  cur_cell: GridCell | null;
  cur_org: Organism | null;
  highlight_org: boolean;
  start_x: number;
  start_y: number;  

  constructor(env: AnyEnvironmentType | null, renderer: Renderer) {
    this.env = env;
    this.control_panel = null;
    this.canvas = (renderer.canvas !== null) ? renderer.canvas : null;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.mouse_c = 0;
    this.mouse_r = 0;
    this.left_click = false;
    this.middle_click = false;
    this.right_click = false;
    this.cur_cell = null;
    this.cur_org = null;
    this.highlight_org = true;
    this.start_x = 0;
    this.start_y = 0;

    this.defineEvents();
  }

  setControlPanel(panel: ControlPanel) {
    this.control_panel = panel;
  }

  defineEvents() {
    if (this.canvas === null) {
      return;
    }
    this.canvas.addEventListener('mousemove', e => {
      this.updateMouseLocation(e.offsetX, e.offsetY);
      this.mouseMove();
    });

    this.canvas.addEventListener('mouseup', (evt) => {
      evt.preventDefault();
      this.updateMouseLocation(evt.offsetX, evt.offsetY);
      this.mouseUp();
      if (evt.button == 0) {
        this.left_click = false;
      }
      if (evt.button == 1) {
        this.middle_click = false;
      }
      if (evt.button == 2) {
        this.right_click = false;
      }
    });

    this.canvas.addEventListener('mousedown', (evt) => {
      evt.preventDefault();
      this.updateMouseLocation(evt.offsetX, evt.offsetY);
      if (evt.button == 0) this.left_click = true;
      if (evt.button == 1) this.middle_click = true;
      if (evt.button == 2) this.right_click = true;
      this.mouseDown();
    });

    this.canvas.addEventListener('contextmenu', function (evt) {
      evt.preventDefault();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.left_click = false;
      this.middle_click = false;
      this.right_click = false;
      if (this.env !== null) {
        this.env.renderer.clearAllHighlights(true);
      }
    });

    this.canvas.addEventListener('mouseenter', (evt) => {
      this.left_click = !!(evt.buttons & 1);
      this.right_click = !!(evt.buttons & 2);
      this.middle_click = !!(evt.buttons & 4);

      this.updateMouseLocation(evt.offsetX, evt.offsetY);
      this.start_x = this.mouse_x;
      this.start_y = this.mouse_y;
    });
  }

  updateMouseLocation(offsetX: number, offsetY: number) {
    if (this.env === null) {
      return;
    }
    var prev_cell = this.cur_cell;
    var prev_org = this.cur_org;
    this.mouse_x = offsetX;
    this.mouse_y = offsetY;
    var colRow = this.env.grid_map.xyToColRow(this.mouse_x, this.mouse_y);
    this.mouse_c = colRow[0];
    this.mouse_r = colRow[1];
    this.cur_cell = this.env.grid_map.cellAt(this.mouse_c, this.mouse_r);
    if (this.cur_cell !== null) {
      this.cur_org = this.cur_cell.owner_org;
      if (this.cur_org != prev_org || this.cur_cell != prev_cell) {
        this.env.renderer.clearAllHighlights(true);
        if (this.cur_org != null && this.highlight_org) {
          this.env.renderer.highlightOrganism(this.cur_org);
        } else if (this.cur_cell != null) {
          this.env.renderer.highlightCell(this.cur_cell);
        }
      }
    }
  }

  mouseMove() {
    alert('mouse move must be overridden');
  }

  mouseDown() {
    alert('mouse down must be overridden');
  }

  mouseUp() {
    alert('mouse up must be overridden');
  }
}

export default EnvironmentController;
