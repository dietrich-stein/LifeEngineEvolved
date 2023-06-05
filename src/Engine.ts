import WorldEnvironment from './Environment/WorldEnvironment';
import ControlPanel from './Interaction/ControlPanel';
import EditorEnvironment from './Environment/EditorEnvironment';
import ColorSchemeManager from './Rendering/ColorSchemeManager';
import { GUI, GUIController, controllers } from './Types/dat.gui';
import Stats from '@dietrich-stein/stats.js';
import WorldConfig from './WorldConfig';

// If the simulation speed is below this value, a new interval will be created to handle ui rendering
// at a reasonable speed. If it is above, the simulation interval will be used to update the ui.
const min_render_speed = 60;

class Engine {
  env: WorldEnvironment;
  organism_editor: EditorEnvironment;
  controlpanel: ControlPanel;
  colorSchemeManager: ColorSchemeManager;
  sim_last_update: number;
  sim_delta_time: number;
  ui_last_update: number;
  ui_delta_time: number;
  running: boolean;
  sim_loop: number;  
  gui: GUI;
  stats: Stats;

  constructor() {
    this.env = new WorldEnvironment();
    this.organism_editor = new EditorEnvironment();
    this.controlpanel = new ControlPanel(this);

    this.colorSchemeManager = new ColorSchemeManager(
      this.env,
      this.organism_editor,
    );
    this.colorSchemeManager.renderColorScheme();

    this.env.OriginOfLife();

    this.sim_last_update = Date.now();
    this.sim_delta_time = 0;

    this.ui_last_update = Date.now();
    this.ui_delta_time = 0;

    this.running = false;
    this.sim_loop = 0;

    // https://github.com/dataarts/dat.gui/blob/master/API.md
    this.gui = new GUI({
      autoPlace: true,
      width: 300,
      hideable: false
    });

    this.stats = new Stats({
      maxFps: 60,
      maxMb: 100,
      containerStyle: 'position:fixed;top:0;right:300px;opacity:0.9;z-index:10000',
      showFps: true,
      showMs: true,
      showMb: true
    });

    this.setupControls();
  }

  handleGridSettingChanged() {
    if (this.env.resetEnvironment()) {
      this.controlpanel.stats_panel.reset();
    }
    this.gui.updateDisplay();
  }

  setupControls() {
    /*
    // @todo: Bring this back
    // Hacky bits to enable title-based tooltips on the folder LI elements
    let eachController = fnc => {
      for (var controllerName in controllers) {
        if (controllers.hasOwnProperty(controllerName)) {
          fnc(controllers[controllerName]);
        }
      }
    };
    let setTitle = (controller: GUIController, val: string) => {
      if (val) {
        controller.__li.setAttribute('title', val);
      } else {
        controller.__li.removeAttribute('title');
      }
      return this;
    };
    eachController((controller) => {
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
    };
    */

    // WORLD
    const folderWorld = this.gui.addFolder('World');
    folderWorld
      .add(this.env, 'auto_reset')
      .onFinishChange(() => {
        if (this.env.auto_reset && !this.running) {
          this.env.auto_reset_count++;
          this.env.resetEnvironment(false);
          this.controlpanel.setPaused(this.running);
        }
      })
      /*.title(
        getController(folderWorld.__controllers, 'auto_reset'),
        'If enabled, automatically resets the environment upon extinction of the last remaining organism. If disabled, the environment is paused.',
      );*/
    folderWorld
      .add(this.env, 'headless')
      .onFinishChange(() => {
        this.controlpanel.toggleHeadless();
      })
      /*.title(
        getController(folderWorld.__controllers, 'headless'),
        'If enabled the environment is not rendered during simulation. Hotkey: H',
      );*/
    folderWorld
      .add(this.env, 'fill_window')
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      /*.title(
        getController(folderWorld.__controllers, 'fill_window'),
        'Render the environment such that it fills your browser window',
      );*/
    folderWorld
      .add(this.env, 'cell_size', 1, 100, 1)
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      /*.title(
        getController(folderWorld.__controllers, 'cell_size'),
        'Sets the width and height of the cells. If fill_window is enabled this determines the row and column counts.',
      );*/
    folderWorld
      .add(this.env, 'num_cols', 1, 1000, 1)
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      /*.title(
        getController(folderWorld.__controllers, 'num_cols'),
        'Sets the number of cell columns in the environment grid if fill_window is disabled.',
      );*/
    folderWorld
      .add(this.env, 'num_rows', 1, 1000, 1)
      .onFinishChange(this.handleGridSettingChanged.bind(this))
      /*.title(
        getController(folderWorld.__controllers, 'num_rows'),
        'Sets the number of cell rows in the environment grid if fill_window is disabled.',
      );*/
    folderWorld
      .add(this.env, 'num_random_orgs', 1, 100, 1)
      /*.title(
        getController(folderWorld.__controllers, 'num_random_orgs'),
        'Sets the number of random organisms generated when resetting with random organisms.',
      );*/
    folderWorld
      .add(
        {
          resetWithRandomOrganisms: () => {
            this.controlpanel.resetWithRandomOrganisms(
              this.env,
              this.env.num_random_orgs,
            );
          },
        },
        'resetWithRandomOrganisms',
        1,
        100,
        1,
      )
      .name('Reset with Random Organisms')
      /*.title(
        getController(folderWorld.__controllers, 'resetWithRandomOrganisms'),
        'Resets the environment and generates random organisms to inhabit it.',
      );*/
    folderWorld.open();

    // COLOR SCHEME
    const folderColorScheme = this.gui.addFolder('Colors');
    // non-living
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'empty')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'empty'),
        'The color of cells containing nothing at all.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'food')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'food'),
        'The color of food cells consumed by the organisms. Organism reproduce when they have eaten enough.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'wall')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'wall'),
        'The color of wall cells that seperate the organisms.',
      );*/
    // living
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'brain')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'brain'),
        'Decides actions utilizing abilities of other cells.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'mouth')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'mouth'),
        'The color of mouth cells used to eats adjacent food.',
      );*/
    folderColorScheme
      .addColor(
        WorldConfig.color_scheme,
        'producer',
      )
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'producer'),
        'The color of producer cells used to produce adjacent food.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'mover')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'mover'),
        'The color of mover cells which enable movement and rotation.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'killer')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'killer'),
        'The color cells when they contains nothing at all.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'armor')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'armor'),
        'The color of armor cells that negates the effects of killer cells.',
      );*/
    folderColorScheme
      .addColor(WorldConfig.color_scheme, 'eye')
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'eye'),
        'The color of eye cells used to observes cells, walls, etc.',
      );*/
    folderColorScheme
      .addColor(
        WorldConfig.color_scheme,
        'eye-slit',
      )
      .onFinishChange(() => {
        this.colorSchemeManager.renderColorScheme();
      })
      /*.title(
        getController(folderColorScheme.__controllers, 'eye-slit'),
        'The color of the slit or pupil rendered within the eye cells.',
      );*/
    //folderColorScheme.open();

    document.body.appendChild(this.stats.dom);
  }

  start() {
    // Start simulation loop
    this.sim_loop = setInterval(() => {
      this.env.update();
    }, 1000 / 60); // 16.67 < ~20ms JS loop
    this.running = true;
    this.render();
  }

  stop() {
    clearInterval(this.sim_loop);
    this.running = false;
  }

  restart() {
    this.stop();
    this.start();
  }

  render() {
    if (!this.running) {
      return;
    }
    this.stats.begin();
    this.env.render();
    this.organism_editor.update();
    this.stats.end();
    requestAnimationFrame(() => {
      this.render();
    });
  }
}

export default Engine;
