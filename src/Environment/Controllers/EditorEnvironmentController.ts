import EnvironmentController from './EnvironmentController';
import Modes from '../../Interaction/ControlModes';
import CellStates from '../../Anatomy/CellStates';
import Directions from '../../Organism/Directions';
import Hyperparams from '../../Hyperparams';
import LoadController from '../../Interaction/LoadController';
import Species from '../../Stats/Species';
import Renderer from '../../Rendering/Renderer';
import { isEditorEnvironment } from '../../Utils/TypeHelpers';
import EyeCell from '../../Anatomy/Cells/EyeCell';
import Cell from '../../Anatomy/Cell';

interface EditorEnvironmentControllerInterface {
  mode: number;
  edit_cell_type: AnatomyCellStatesType | null;
  highlight_org: boolean;
  load_controller: LoadController;
  mouseMove: () => void;
  mouseDown: () => void;
  mouseUp: () => void;
  getCurLocalCell: () => Cell | null
  editOrganism: () => void;
  updateDetails: () => void;
  defineCellTypeSelection: () => void;
  defineEditorDetails: () => void;
  defineSaveLoad: () => void;
  loadOrg: (org: any) => void;
  clearDetailsPanel: () => void;
  refreshDetailsPanel: () => void;
  setDetailsPanel: () => void;
  setEditorPanel: () => void;
  setBrainPanelVisibility: () => boolean;
  setBrainDetails: () => void;
  setMoveRangeVisibility: () => boolean;
  setBrainEditorValues: (decision: string) => void;
  setRandomizePanel: () => void;
}

class EditorEnvironmentController extends EnvironmentController implements EditorEnvironmentControllerInterface {
  mode: number;
  edit_cell_type: AnatomyCellStatesType | null;
  highlight_org: boolean;
  load_controller: LoadController;

  constructor(env: EditorEnvironment, renderer: Renderer) {
    super(env, renderer);
    this.mode = Modes.None;
    this.edit_cell_type = null;
    this.highlight_org = false;
    this.load_controller = new LoadController();    

    this.defineCellTypeSelection();
    this.defineEditorDetails();
    this.defineSaveLoad();
  }

  mouseMove() {
    if (this.right_click || this.left_click) {
      this.editOrganism();
    }
  }

  mouseDown() {
    this.editOrganism();
  }

  mouseUp() {}

  getCurLocalCell() {
    if (
      this.env === null || 
      !isEditorEnvironment(this.env) ||
      this.env.organism === null
    ) {
      return null;
    }
    return this.env.organism.anatomy.getLocalCell(
      this.mouse_c - this.env.organism.c,
      this.mouse_r - this.env.organism.r,
    );
  }

  editOrganism() {
    if (
      this.env === null ||    
      !isEditorEnvironment(this.env) ||
      this.edit_cell_type == null ||
      this.cur_cell == null ||
      this.mode != Modes.Edit
    ) {
      return;
    }
    if (this.left_click) {
      if (
        this.edit_cell_type == CellStates.eye &&
        this.cur_cell.state == CellStates.eye
      ) {
        var loc_cell = this.getCurLocalCell();
        if (loc_cell !== null && loc_cell.state == CellStates.eye) {
          (loc_cell as EyeCell).direction = Directions.rotateRight((loc_cell as EyeCell).direction);
        }
        this.env.renderFull();
      } else {
        this.env.addCellToOrg(this.mouse_c, this.mouse_r, this.edit_cell_type);
      }
    } else if (this.right_click) {
      this.env.removeCellFromOrg(this.mouse_c, this.mouse_r);
    }

    this.setBrainPanelVisibility();
    this.setMoveRangeVisibility();
    this.updateDetails();
  }

  updateDetails() {
    if (
      this.env === null || 
      !isEditorEnvironment(this.env) ||
      this.env.organism === null
    ) {
      return;
    }    
    $('.cell-count').text(
      'Cell count: ' + this.env.organism.anatomy.cells.length,
    );
    if (this.env.organism.isNatural()) {
      $('#unnatural-org-warning').css('display', 'none');
    } else {
      $('#unnatural-org-warning').css('display', 'block');
    }
  }

  defineCellTypeSelection() {
    var self = this;
    $('.cell-type').click(function () {
      switch (this.id) {
        case 'brain':
          self.edit_cell_type = CellStates.brain;
          break;
        case 'mouth':
          self.edit_cell_type = CellStates.mouth;
          break;
        case 'producer':
          self.edit_cell_type = CellStates.producer;
          break;
        case 'mover':
          self.edit_cell_type = CellStates.mover;
          break;
        case 'killer':
          self.edit_cell_type = CellStates.killer;
          break;
        case 'armor':
          self.edit_cell_type = CellStates.armor;
          break;
        case 'eye':
          self.edit_cell_type = CellStates.eye;
          break;
      }
      $('.cell-type').css('border-color', 'black');
      var selected = '#' + this.id + '.cell-type';
      $(selected).css('border-color', 'yellow');
    });
  }

  defineEditorDetails() {
    var env = <EditorEnvironment> this.env;
    if (env === null) {
      return;
    }
    var self = this;

    // @todo: wut?
    //this.details_html = $('#organism-details');
    //this.edit_details_html = $('#edit-organism-details');
    //this.decision_names = ['ignore', 'move away', 'move towards'];

    $('#move-range-edit').change((event: JQuery.ChangeEvent) => {
      if (env.organism === null) {
        return;
      }      
      env.organism.move_range = parseInt(event.target.value);
    });
    $('#mutation-rate-edit').change((event: JQuery.ChangeEvent) => {
      if (env.organism === null) {
        return;
      }      
      env.organism.mutability = parseInt(event.target.value);
    });
    $('#observation-type-edit').change((event: JQuery.ChangeEvent) => {
      this.setBrainEditorValues(event.target.value);
      self.setBrainDetails();
    });
    $('#reaction-edit').change((event: JQuery.ChangeEvent) => {
      if (env.organism === null) {
        return;
      }
      var obs = $('#observation-type-edit').val();
      var decision = parseInt(event.target.value);
      if (typeof obs === 'string' && env.organism.brain !== null) {
        env.organism.brain.decisions[obs] = decision;
        self.setBrainDetails();
      }
    });
  }

  defineSaveLoad() {
    var env = <EditorEnvironment> this.env;
    if (env === null) {
      return;
    }    
    $('#save-org').click(() => {
      if (env.organism === null) {
        return;
      }      
      let org = env.organism.serialize();
      let data =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(org));
      let downloadEl = document.getElementById('download-el');
      if (downloadEl !== null) {
        downloadEl.setAttribute('href', data);
        downloadEl.setAttribute('download', 'organism.json');
        downloadEl.click();
      }
    });
    $('#load-org').click(() => {
      this.load_controller.loadJson((org: any) => {
        this.loadOrg(org);
      });
    });
  }

  loadOrg(org: any) {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null) {
      return;
    }    
    env.clear();
    env.organism.loadRaw(org);
    this.refreshDetailsPanel();
    env.organism.updateGrid();
    env.renderFull();
    env.organism.species = new Species(env.organism.anatomy, null, 0);
    if (org.species_name) {
      env.organism.species.name = org.species_name;
    }
    if (this.mode === Modes.Clone) {
      $('#drop-org').click();
    }
  }

  clearDetailsPanel() {
    $('#organism-details').css('display', 'none');
    $('#edit-organism-details').css('display', 'none');
    $('#randomize-organism-details').css('display', 'none');
  }

  refreshDetailsPanel() {
    if (this.mode === Modes.Edit) {
      this.setEditorPanel();
    } else {
      this.setDetailsPanel();
    }
  }

  setDetailsPanel() {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null) {
      return;
    }    
    this.clearDetailsPanel();
    this.updateDetails();
    $('#move-range').text('Move Range: ' + env.organism.move_range);
    $('#mutation-rate').text('Mutation Rate: ' + env.organism.mutability);

    let display = (Hyperparams.useGlobalMutability)
      ? 'none'
      : 'block';
    $('#mutation-rate').css('display', display);

    this.setMoveRangeVisibility();

    if (this.setBrainPanelVisibility()) {
      this.setBrainDetails();
    }
    $('#organism-details').css('display', 'block');
  }

  setEditorPanel() {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null) {
      return;
    }    
    this.clearDetailsPanel();

    $('.cell-count').text('Cell count: ' + env.organism.anatomy.cells.length);
    if (this.setMoveRangeVisibility()) {
      $('#move-range-edit').val(env.organism.move_range);
    }

    $('#mutation-rate-edit').val(env.organism.mutability);

    let display = (Hyperparams.useGlobalMutability)
      ? 'none'
      : 'block';    
    $('#mutation-rate-cont').css('display', display);

    if (this.setBrainPanelVisibility()) {
      let decision = $('#observation-type-edit').val();
      if (typeof decision === 'string') {
        this.setBrainEditorValues(decision);
      }
    }

    $('#cell-selections').css('display', 'grid');
    $('#edit-organism-details').css('display', 'block');
  }

  setBrainPanelVisibility() {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null) {
      return false;
    }     
    if (env.organism.anatomy.has_brain) {
      $('.brain-details').css('display', 'block');
      return true;
    }
    $('.brain-details').css('display', 'none');
    return false;
  }

  setBrainDetails() {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null || env.organism.brain === null) {
      return;
    }    
    var chase_types = [];
    var retreat_types = [];
    for (var cell_name in env.organism.brain.decisions) {
      var decision = env.organism.brain.decisions[cell_name];
      if (decision == 1) {
        retreat_types.push(cell_name);
      } else if (decision == 2) {
        chase_types.push(cell_name);
      }
    }
    $('.chase-types').text('Move Towards: ' + chase_types);
    $('.retreat-types').text('Move Away From: ' + retreat_types);
  }

  setMoveRangeVisibility() {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null) {
      return false;
    }    
    if (env.organism.anatomy.has_mover) {
      $('#move-range-cont').css('display', 'block');
      $('#move-range').css('display', 'block');
      return true;
    }
    $('#move-range-cont').css('display', 'none');
    $('#move-range').css('display', 'none');
    return false;
  }

  setBrainEditorValues(decision: string) {
    var env = <EditorEnvironment> this.env;
    if (env === null || env.organism === null || env.organism.brain === null) {
      return;
    }    
    $('#observation-type-edit').val(decision);
    var reaction = env.organism.brain.decisions[decision];
    $('#reaction-edit').val(reaction);
  }

  setRandomizePanel() {
    this.clearDetailsPanel();
    $('#randomize-organism-details').css('display', 'block');
  }
}

export default EditorEnvironmentController;
