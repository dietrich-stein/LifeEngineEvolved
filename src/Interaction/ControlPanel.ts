import Hyperparams from '../Hyperparams';
import Modes from './ControlModes';
import StatsPanel from '../Stats/StatsPanel';
import WorldConfig from '../WorldConfig';
import LoadController from './LoadController';
import RandomOrganismGenerator from '../Organism/RandomOrganismGenerator';
import Species from '../Stats/Species';
import Engine from '../Engine';
import EditorController from '../Environment/Controllers/EditorEnvironmentController';
import EnvironmentController from '../Environment/Controllers/WorldEnvironmentController';
import Organism from '../Organism/Organism';

interface ControlPanelInterface {
  engine: Engine;
  load_controller: LoadController;
  organism_record: number;
  world_env_controller: EnvironmentController;
  editor_env_controller: EditorController;
  stats_panel: StatsPanel;
  headless_opacity: number;
  opacity_change_rate: number;
  paused: boolean;
  control_panel_active: boolean;
  no_hud: boolean;
  tab_id: string;
}

class ControlPanel implements ControlPanelInterface {
  engine: Engine;
  load_controller: LoadController;  
  organism_record: number;
  world_env_controller: EnvironmentController;
  editor_env_controller: EditorController;
  stats_panel: StatsPanel;
  headless_opacity: number;
  opacity_change_rate: number;
  paused: boolean;
  control_panel_active: boolean;
  no_hud: boolean;
  tab_id: string;

  constructor(engine: Engine) {
    this.engine = engine;
    this.organism_record = 0;
    this.world_env_controller = this.engine.env.controller;
    this.editor_env_controller = this.engine.organism_editor.controller;
    this.stats_panel = new StatsPanel(this.engine.env);
    this.headless_opacity = 1;
    this.opacity_change_rate = -0.8;
    this.paused = false;
    this.control_panel_active = false;
    this.no_hud = false;
    this.tab_id = '';

    this.world_env_controller.setControlPanel(this);
    this.editor_env_controller.setControlPanel(this);

    this.defineMinMaxControls();
    this.defineHotkeys();
    this.defineEngineSpeedControls();
    this.defineTabNavigation();
    this.defineHyperparameterControls();
    this.defineWorldControls();
    this.defineModeControls();
    this.setHyperparamDefaults();

    this.load_controller = new LoadController(this);
    this.load_controller.init();
  }

  toggleHeadless() {
    $('.headless').find('i').toggleClass('fa fa-eye');
    $('.headless').find('i').toggleClass('fa fa-eye-slash');
    if (WorldConfig.headless) {
      $('#headless-notification').css('display', 'none');
      this.engine.env.renderFull();
    } else {
      $('#headless-notification').css('display', 'block');
    }
    WorldConfig.headless = !WorldConfig.headless;
  }

  resetWithRandomOrganisms(env: WorldEnvironment, num_organisms: number) {
    let reset_confirmed = env.resetEnvironment(true, false);
    if (!reset_confirmed) {
      return;
    }

    let size = Math.ceil(8); // @todo: parameterize and expose

    for (let i = 0; i < num_organisms; i++) {
      let newOrganism = RandomOrganismGenerator.generate(env);
      newOrganism.species = new Species(newOrganism.anatomy, null, 0);
      var col = Math.floor(
        size + Math.random() * (env.grid_map.cols - size * 2),
      );
      var row = Math.floor(
        size + Math.random() * (env.grid_map.rows - size * 2),
      );
      env.controller.dropOrganism(newOrganism, col, row);
    }
  }

  defineMinMaxControls() {
    this.control_panel_active = false;
    this.no_hud = false;
    $('#minimize').click(() => {
      $('.control-panel').css('display', 'none');
      $('.hot-controls').css('display', 'block');
      this.control_panel_active = false;
      this.stats_panel.stopAutoRender();
    });
    $('#maximize').click(() => {
      $('.control-panel').css('display', 'grid');
      $('.hot-controls').css('display', 'none');
      this.control_panel_active = true;
      if (this.tab_id == 'stats') {
        this.stats_panel.startAutoRender();
      }
    });
  }

  defineHotkeys() {
    $('body').keydown((event: JQuery.KeyDownEvent) => {
      let focused = document.activeElement;
      if (
        focused !== null && 
        focused.tagName === 'INPUT' &&
        focused.getAttribute('type') === 'text'
      ) {
        return;
      }
      switch (event.key.toLowerCase()) {
        // hot bar controls
        case 'a':
          $('.reset-view')[0].click();
          break;
        case 's':
          $('#drag-view').click();
          break;
        case 'd':
          $('#wall-drop').click();
          break;
        case 'f':
          $('#food-drop').click();
          break;
        case 'g':
          $('#click-kill').click();
          break;
        case 'h':
          this.toggleHeadless();
          break;
        case 'j':
        case ' ':
          event.preventDefault();
          $('.pause-button')[0].click();
          break;
        // miscellaneous hotkeys
        case 'q': // minimize/maximize control panel
          event.preventDefault();
          if (this.control_panel_active) {
            $('#minimize').click();
          } else {
            $('#maximize').click();
          }
          break;
        case 'z':
          $('#select').click();
          break;
        case 'x':
          $('#edit').click();
          break;
        case 'c':
          $('#drop-org').click();
          break;
        case 'v': // toggle hud
          if (this.no_hud) {
            let control_panel_display = this.control_panel_active
              ? 'grid'
              : 'none';
            let hot_control_display = !this.control_panel_active
              ? 'block'
              : 'none';
            if (this.control_panel_active && this.tab_id == 'stats') {
              this.stats_panel.startAutoRender();
            }
            $('.control-panel').css('display', control_panel_display);
            $('.hot-controls').css('display', hot_control_display);
            $('.community-section').css('display', 'block');
          } else {
            $('.control-panel').css('display', 'none');
            $('.hot-controls').css('display', 'none');
            $('.community-section').css('display', 'none');
            this.load_controller.close();
          }
          this.no_hud = !this.no_hud;
          break;
        case 'b':
          $('#clear-walls').click();
      }
    });
  }

  defineEngineSpeedControls() {
    // @TODO: Needs to be reimplemented for dat.GUI anyway
    /*
    this.slider = document.getElementById('slider');
    this.slider.oninput = function () {
      const max_fps = 300;
      this.fps = this.slider.value;
      if (this.fps >= max_fps) this.fps = 1000;
      if (this.engine.running) {
        this.changeEngineSpeed(this.fps);
      }
      let text = this.fps >= max_fps ? 'MAX' : this.fps;
      $('#fps').text('Target FPS: ' + text);
    }.bind(this);
    */
    let self = this;
    $('.pause-button').click(
      function () {
        // toggle pause
        self.setPaused(self.engine.running);
      }.bind(this),
    );
  }

  defineTabNavigation() {
    this.tab_id = 'world-controls';
    var self = this;
    $('.tabnav-item').click(function () {
      $('.tab').css('display', 'none');
      var tab = '#' + this.id + '.tab';
      $(tab).css('display', 'grid');
      $('.tabnav-item').removeClass('open-tab');
      $('#' + this.id + '.tabnav-item').addClass('open-tab');
      self.engine.organism_editor.is_active = this.id == 'editor';
      self.stats_panel.stopAutoRender();
      if (this.id === 'stats') {
        self.stats_panel.startAutoRender();
      } else if (this.id === 'editor') {
        self.editor_env_controller.refreshDetailsPanel();
      }
      self.tab_id = this.id;
    });
  }

  defineWorldControls() {
    $('#clear-walls-reset').change((event: JQuery.ChangeEvent) => {
      WorldConfig.clear_walls_on_reset = event.target.checked;
    });
    $('#reset-with-editor-org').click(() => {
      let env = this.engine.env;
      if (env.fill_window) {
        if (!env.resetForWindow(env.cell_size, true, false)) {
          return;
        }
      } else {
        if (
          !env.resetForSize(
            env.cell_size,
            env.num_cols,
            env.num_rows,
            true,
            false,
          )
        ) {
          return;
        }
      }
      let center = env.grid_map.getCenter();
      let editor_env = this.editor_env_controller.env;
      if (editor_env !== null) {
        let org = (editor_env as EditorEnvironment).getCopyOfOrg();
        if (org !== null) {
          this.world_env_controller.dropOrganism(org, center[0], center[1]);
        }
      }
    });
    $('#save-env').click(() => {
      let was_running = this.engine.running;
      this.setPaused(true);
      let env = this.engine.env.serialize();
      let data =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(env));
      let downloadEl = document.getElementById('download-el');
      if (downloadEl !== null) {
        downloadEl.setAttribute('href', data);
        downloadEl.setAttribute('download', $('#save-env-name').val() + '.json');
        downloadEl.click();
      }
      if (was_running) {
        this.setPaused(false);
      }
    });
    $('#load-env').click(() => {
      this.load_controller.loadJson((env: any) => {
        this.loadEnv(env);
      });
    });
    $('#upload-env').change((event: JQuery.ChangeEvent) => {
      let files: FileList | null = (event.target as HTMLInputElement).files;
      if (files === null || !files.length) {
        return;
      }
      let reader = new FileReader();
      reader.onload = (ev: ProgressEvent) => {
        try {
          if (ev.target !== null) {
            let result = (<FileReader>ev.target).result;
            if (typeof result === 'string') {
              let env = JSON.parse(result);
              this.loadEnv(env);              
            } else {
              alert('Failed to load world');              
            }
          }          
        } catch (err) {
          console.error(err);
          alert('Failed to load world');
        }
        let els = $('#upload-env');
        if (els.length > 0) {
          let input = els[0];
          (input as HTMLInputElement).value = '';
        }        
      };
      reader.readAsText(files[0]);
    });
  }

  loadEnv(env: WorldEnvironment) {
    if (this.tab_id == 'stats') {
      this.stats_panel.stopAutoRender();
    }
    let was_running = this.engine.running;
    this.setPaused(true);
    this.engine.env.loadRaw(env);
    if (was_running) {
      this.setPaused(false);
    }
    this.updateHyperparamUIValues();
    this.world_env_controller.resetView();
    if (this.tab_id == 'stats') {
      this.stats_panel.startAutoRender();
    }
  }

  defineHyperparameterControls() {
    let self = this;
    $('#food-prod-prob').change((event: JQuery.ChangeEvent) => {
      let val = event.target.value;
      val = (typeof val === 'number') 
        ? val 
        : (typeof val === 'string')
          ? parseInt(val)
          : 0;
      Hyperparams.foodProdProb = val;
    });
    $('#lifespan-multiplier').change((event: JQuery.ChangeEvent) => {
      let val = event.target.value;
      val = (typeof val === 'number') 
        ? val 
        : (typeof val === 'string')
          ? parseInt(val)
          : 0;
      Hyperparams.lifespanMultiplier = val;
    });
    $('#rot-enabled').change((event: JQuery.ChangeEvent) => {
      Hyperparams.rotationEnabled = event.target.checked;
    });
    $('#insta-kill').change((event: JQuery.ChangeEvent) => {
      Hyperparams.instaKill = event.target.checked;
    });
    $('#look-range').change((event: JQuery.ChangeEvent) => {
      let val = event.target.value;
      val = (typeof val === 'number') 
        ? val 
        : (typeof val === 'string')
          ? parseInt(val)
          : 0;      
      Hyperparams.lookRange = val;
    });
    $('#see-through-self').change((event: JQuery.ChangeEvent) => {
      Hyperparams.seeThroughSelf = event.target.checked;
    });
    $('#food-drop-rate').change((event: JQuery.ChangeEvent) => {
      let val = event.target.value;
      val = (typeof val === 'number') 
        ? val 
        : (typeof val === 'string')
          ? parseInt(val)
          : 0;
      Hyperparams.foodDropProb = val;
    });
    $('#extra-mover-cost').change((event: JQuery.ChangeEvent) => {
      let val = event.target.value;
      val = (typeof val === 'number') 
        ? val 
        : (typeof val === 'string')
          ? parseInt(val)
          : 0;
      Hyperparams.extraMoverFoodCost = val;
    });
    $('#evolved-mutation').change((event: JQuery.ChangeEvent) => {
      if (event.target.checked) {
        $('.global-mutation-in').css('display', 'none');
        $('#avg-mut').css('display', 'block');
      } else {
        $('.global-mutation-in').css('display', 'block');
        $('#avg-mut').css('display', 'none');
      }
      Hyperparams.useGlobalMutability = !event.target.checked;
    });
    $('#global-mutation').change((event: JQuery.ChangeEvent) => {
      let val = event.target.value;
      val = (typeof val === 'number') 
        ? val 
        : (typeof val === 'string')
          ? parseInt(val)
          : 0;      
      Hyperparams.globalMutability = val;
    });
    $('.mut-prob').change((event: JQuery.ChangeEvent) => {
      let id = event.target.getAttribute('id');
      let val = parseInt((event.target as HTMLInputElement).value);
      switch (id) {
        case 'add-prob':
          Hyperparams.addProb = val;
          break;
        case 'change-prob':
          Hyperparams.changeProb = val;
          break;
        case 'remove-prob':
          Hyperparams.removeProb = val;
          break;
      }
      $('#add-prob').val(Math.floor(Hyperparams.addProb));
      $('#change-prob').val(Math.floor(Hyperparams.changeProb));
      $('#remove-prob').val(Math.floor(Hyperparams.removeProb));
    });
    $('#movers-produce').change((event: JQuery.ChangeEvent) => {
      Hyperparams.moversCanProduce = event.target.checked;
    });
    $('#food-blocks').change((event: JQuery.ChangeEvent) => {
      Hyperparams.foodBlocksReproduction = event.target.checked;
    });
    $('#reset-rules').click(() => {
      self.setHyperparamDefaults();
    });
    $('#save-controls').click(() => {
      let data =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(Hyperparams));
      let downloadEl = document.getElementById('download-el');
      if (downloadEl !== null) {
        downloadEl.setAttribute('href', data);
        downloadEl.setAttribute('download', 'controls.json');
        downloadEl.click();
      }
    });
    $('#load-controls').click(() => {
      $('#upload-hyperparams').click();
    });
    $('#upload-hyperparams').change((event: JQuery.ChangeEvent) => {
      let uploadInput = (event.target as HTMLInputElement)
      let files: FileList | null = uploadInput.files;
      if (files === null || !files.length) {
        return;
      }
      let reader = new FileReader();
      reader.onload = (ev: ProgressEvent) => {
        try {
          if (ev.target !== null) {
            let result = (<FileReader>ev.target).result;
            if (typeof result === 'string') {
              let json = JSON.parse(result);
              Hyperparams.loadJsonObj(json);
              this.updateHyperparamUIValues();
              // have to clear the value so change() will be triggered if the same file is uploaded again
              uploadInput.value = '';              
            } else {
              alert('Failed to load');              
            }
          }
          self.load_controller.close(); // why?
        } catch (err) {
          console.error(err);
          alert('Failed to load');
        }        
      };
      reader.readAsText(files[0]);
    });
  }

  setHyperparamDefaults() {
    this.updateHyperparamUIValues();
  }

  updateHyperparamUIValues() {
    $('#food-prod-prob').val(Hyperparams.foodProdProb);
    $('#lifespan-multiplier').val(Hyperparams.lifespanMultiplier);
    $('#rot-enabled').prop('checked', Hyperparams.rotationEnabled);
    $('#insta-kill').prop('checked', Hyperparams.instaKill);
    $('#evolved-mutation').prop('checked', !Hyperparams.useGlobalMutability);
    $('#add-prob').val(Hyperparams.addProb);
    $('#change-prob').val(Hyperparams.changeProb);
    $('#remove-prob').val(Hyperparams.removeProb);
    $('#movers-produce').prop('checked', Hyperparams.moversCanProduce);
    $('#food-blocks').prop('checked', Hyperparams.foodBlocksReproduction);
    $('#food-drop-rate').val(Hyperparams.foodDropProb);
    $('#extra-mover-cost').val(Hyperparams.extraMoverFoodCost);
    $('#look-range').val(Hyperparams.lookRange);
    $('#see-through-self').prop('checked', Hyperparams.seeThroughSelf);
    $('#global-mutation').val(Hyperparams.globalMutability);

    if (!Hyperparams.useGlobalMutability) {
      $('.global-mutation-in').css('display', 'none');
      $('#avg-mut').css('display', 'block');
    } else {
      $('.global-mutation-in').css('display', 'block');
      $('#avg-mut').css('display', 'none');
    }
  }

  defineModeControls() {
    var self = this;
    var engine_env = this.engine.env;    
    $('.edit-mode-btn').click(function () {
      $('#cell-selections').css('display', 'none');
      $('#organism-options').css('display', 'none');
      self.editor_env_controller.setDetailsPanel();
      switch (this.id) {
        case 'food-drop':
          self.setMode(Modes.FoodDrop);
          break;
        case 'wall-drop':
          self.setMode(Modes.WallDrop);
          break;
        case 'click-kill':
          self.setMode(Modes.ClickKill);
          break;
        case 'select':
          self.setMode(Modes.Select);
          break;
        case 'edit':
          self.setMode(Modes.Edit);
          break;
        case 'drop-org':
          self.setMode(Modes.Clone);
          break;
        case 'drag-view':
          self.setMode(Modes.Drag);
      }
      $('.edit-mode-btn').removeClass('selected');
      $('.' + this.id).addClass('selected');
    });
    $('.reset-view').click(() => {
      self.world_env_controller.resetView();
    });
    $('#reset-env').click(() => {
      if (engine_env.resetEnvironment()) {
        self.stats_panel.reset();
      }
    });
    $('#clear-env').click(() => {
      if (engine_env.resetEnvironment(true, false)) {
        this.stats_panel.reset();
      }
    });
    $('#brush-slider').on('input change', (event: JQuery.ChangeEvent | any) => {
      WorldConfig.brush_size = parseInt(event.target.value);
    });
    $('#random-walls').click(() => {
      this.world_env_controller.randomizeWalls();
    });
    $('#clear-walls').click(() => {
      engine_env.clearWalls();
    });
    $('#clear-editor').click(() => {
      this.engine.organism_editor.setDefaultOrg();
      this.editor_env_controller.setEditorPanel();
    });
    $('#generate-random').click(() => {
      this.engine.organism_editor.createRandom();
      this.editor_env_controller.refreshDetailsPanel();
    });

    window.onbeforeunload = function (e) {
      e = e || window.event;
      let return_str = 'this will cause a confirmation on page close';
      if (e) {
        e.returnValue = return_str;
      }
      return return_str;
    };
  }

  setPaused(paused: boolean) {
    if (paused) {
      $('.pause-button').find('i').removeClass('fa-pause');
      $('.pause-button').find('i').addClass('fa-play');
      if (this.engine.running) {
        this.engine.stop();
      }
    } else if (!paused) {
      $('.pause-button').find('i').addClass('fa-pause');
      $('.pause-button').find('i').removeClass('fa-play');
      if (!this.engine.running) {
        this.engine.start();
      }
    }
  }

  setMode(mode: number) {
    this.world_env_controller.mode = mode;
    this.editor_env_controller.mode = mode;

    if (mode == Modes.Edit) {
      this.editor_env_controller.setEditorPanel();
    }

    if (mode == Modes.Clone) {
      this.world_env_controller.org_to_clone =
        this.engine.organism_editor.getCopyOfOrg();
    }
  }

  setEditorOrganism(org: Organism) {
    this.engine.organism_editor.setOrganismToCopyOf(org);
    this.editor_env_controller.clearDetailsPanel();
    this.editor_env_controller.setDetailsPanel();
  }

  // @todo: fix
  changeEngineSpeed(change_val: number) {
    this.engine.restart();
  }

  updateHeadlessIcon(delta_time: number) {
    if (!this.engine.running) return;
    const min_opacity = 0.4;
    var op =
      this.headless_opacity + (this.opacity_change_rate * delta_time) / 1000;
    if (op <= min_opacity) {
      op = min_opacity;
      this.opacity_change_rate = -this.opacity_change_rate;
    } else if (op >= 1) {
      op = 1;
      this.opacity_change_rate = -this.opacity_change_rate;
    }
    this.headless_opacity = op;
    $('#headless-notification').css('opacity', op * 100 + '%');
  }

  update(delta_time: number) {
    $('#reset-count').text(
      'Auto reset count: ' + this.engine.env.auto_reset_count,
    );
    this.stats_panel.updateDetails();
    if (WorldConfig.headless) this.updateHeadlessIcon(delta_time);
  }
}

export default ControlPanel;
