import WorldEnvironment from './Environments/WorldEnvironment';
import ControlPanel from './Controllers/ControlPanel';
import OrganismEditor from './Environments/OrganismEditor';
import ColorSchemeManager from './Rendering/ColorSchemeManager';
import { GUI, controllers } from 'dat.gui';

// If the simulation speed is below this value, a new interval will be created to handle ui rendering
// at a reasonable speed. If it is above, the simulation interval will be used to update the ui.
const min_render_speed = 60;

class Engine {
  constructor() {
    this.fps = 60;
    this.env = new WorldEnvironment();
    this.organism_editor = new OrganismEditor();
    this.controlpanel = new ControlPanel(this);

    this.colorSchemeManager = new ColorSchemeManager(this.env, this.organism_editor);
    this.colorSchemeManager.renderColorScheme();

    this.env.OriginOfLife();

    this.sim_last_update = Date.now();
    this.sim_delta_time = 0;

    this.ui_last_update = Date.now();
    this.ui_delta_time = 0;

    this.actual_fps = 0;
    this.running = false;

    // https://github.com/dataarts/dat.gui/blob/master/API.md
    this.gui = new GUI({
      //autoPlace: false
    });
    this.setGUI();
  }

  handleGridSettingChanged() {
    if (this.env.resetEnvironment()) {
      this.controlpanel.stats_panel.reset();
    }
    this.gui.updateDisplay();
  }

  setGUI() {
    // Hacky bits to enable title-based tooltips on the folder LI elements
    let eachController = (fnc) => {
      for (var controllerName in controllers) {
        if (controllers.hasOwnProperty(controllerName)) {
          fnc(controllers[controllerName]);
        }
      }
    }
    let setTitle = (controller, val) => {
      if (val) {
        controller.__li.setAttribute('title', val);
      } else {
        controller.__li.removeAttribute('title')
      }
      return this;
    };
    eachController(function(controller) {
      if (!controller.prototype.hasOwnProperty('title')) {
        controller.prototype.title = setTitle;
      }
    });
    let getController = (controllers, name) => {
      let controller = null;
      for (let i = 0; i < controllers.length; i++) {
        let c = controllers[i];
        if (c.property == name || c.name == name) {
          controller = c;
          break;
        }
      }
      return controller;
    }

    // WORLD
    const folderWorld = this.gui.addFolder("World");
    folderWorld
      .add(this.env, 'auto_reset')
      .onFinishChange(() => {
        if (this.env.auto_reset && !this.running) {
          this.env.auto_reset_count++;
          this.env.resetEnvironment(false);
          this.controlpanel.setPaused(this.running);
        }
      })
      .title(
        getController(folderWorld.__controllers, 'auto_reset'),
        'If enabled, automatically resets the environment upon extinction of the last remaining organism. If disabled, the environment is paused.'
      );
    folderWorld
      .add(this.env, 'headless')
      .onFinishChange(() => {
        this.controlpanel.toggleHeadless();  
      })
      .title(
        getController(folderWorld.__controllers, 'headless'),
        'If enabled the environment is not rendered during simulation. Hotkey: H'
      );      
    folderWorld
      .add(this.env, 'fill_window')
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      .title(
        getController(folderWorld.__controllers, 'fill_window'),
        'Render the environment such that it fills your browser window'
      );
    folderWorld
      .add(this.env, 'cell_size', 1, 100, 1)
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      .title(
        getController(folderWorld.__controllers, 'cell_size'),
        'Sets the width and height of the cells. If fill_window is enabled this determines the row and column counts.'
      );
    folderWorld
      .add(this.env, 'num_cols', 1, 1000, 1)
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      .title(
        getController(folderWorld.__controllers, 'num_cols'),
        'Sets the number of cell columns in the environment grid if fill_window is disabled.'
      );
    folderWorld
      .add(this.env, 'num_rows', 1, 1000, 1)
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      .title(
        getController(folderWorld.__controllers, 'num_rows'),
        'Sets the number of cell rows in the environment grid if fill_window is disabled.'
      );
    folderWorld
      .add(this.env, 'num_random_orgs', 1, 100, 1)
      .title(
        getController(folderWorld.__controllers, 'num_random_orgs'),
        'Sets the number of random organisms generated when resetting with random organisms.'
      );
    folderWorld
      .add({
        resetWithRandomOrganisms: () => {
          this.controlpanel.resetWithRandomOrganisms(this.env, this.env.num_random_orgs)
        }
      }, 'resetWithRandomOrganisms', 1, 100, 1)
      .name('Reset with Random Organisms')
      .title(
        getController(folderWorld.__controllers, 'resetWithRandomOrganisms'),
        'Resets the environment and generates random organisms to inhabit it.'
      );
    folderWorld.open();

    // COLOR SCHEME
    const folderColorScheme = this.gui.addFolder("Colors");
    // non-living
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'empty')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'empty'),
        'The color of cells containing nothing at all.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'food')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'food'),
        'The color of food cells consumed by the organisms. Organism reproduce when they have eaten enough.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'wall')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'wall'),
        'The color of wall cells that seperate the organisms.'
      );
    // living
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'brain')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'brain'),
        'Decides actions utilizing abilities of other cells.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'mouth')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'mouth'),
        'The color of mouth cells used to eats adjacent food.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'producer')
      .onFinishChange(() => { this.colorSchemeManager.renderColorSchem(); })
      .title(
        getController(folderColorScheme.__controllers, 'producer'),
        'The color of producer cells used to produce adjacent food.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'mover')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'mover'),
        'The color of mover cells which enable movement and rotation.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'killer')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'killer'),
        'The color cells when they contains nothing at all.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'armor')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'armor'),
        'The color of armor cells that negates the effects of killer cells.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'eye')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'eye'),
        'The color of eye cells used to observes cells, walls, etc.'
      );
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'eye-slit')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); })
      .title(
        getController(folderColorScheme.__controllers, 'eye-slit'),
        'The color of the slit or pupil rendered within the eye cells.'
      );
    //folderColorScheme.open();
  }

  start(fps = 60) {
    if (fps <= 0) fps = 1;
    this.fps = fps;
    this.sim_loop = setInterval(() => {
      this.updateSimDeltaTime();
      this.environmentUpdate();
    }, 1000 / fps);
    this.running = true;
    if (this.fps >= min_render_speed) {
      if (this.ui_loop != null) {
        clearInterval(this.ui_loop);
        this.ui_loop = null;
      }
    } else this.setUiLoop();
  }

  stop() {
    clearInterval(this.sim_loop);
    this.running = false;
    this.setUiLoop();
  }

  restart(fps) {
    clearInterval(this.sim_loop);
    this.start(fps);
  }

  setUiLoop() {
    if (!this.ui_loop) {
      this.ui_loop = setInterval(() => {
        this.updateUIDeltaTime();
        this.necessaryUpdate();
      }, 1000 / min_render_speed);
    }
  }

  updateSimDeltaTime() {
    this.sim_delta_time = Date.now() - this.sim_last_update;
    this.sim_last_update = Date.now();
    if (!this.ui_loop)
      // if the ui loop isn't running, use the sim delta time
      this.ui_delta_time = this.sim_delta_time;
  }

  updateUIDeltaTime() {
    this.ui_delta_time = Date.now() - this.ui_last_update;
    this.ui_last_update = Date.now();
  }

  environmentUpdate() {
    this.actual_fps = 1000 / this.sim_delta_time;
    this.env.update(this.sim_delta_time);
    if (this.ui_loop == null) {
      this.necessaryUpdate();
    }
  }

  necessaryUpdate() {
    this.env.render();
    this.controlpanel.update(this.ui_delta_time);
    this.organism_editor.update();
  }
}

export default Engine;
