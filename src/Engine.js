import WorldEnvironment from './Environments/WorldEnvironment';
import ControlPanel from './Controllers/ControlPanel';
import OrganismEditor from './Environments/OrganismEditor';
import ColorSchemeManager from './Rendering/ColorSchemeManager';
import { GUI } from 'dat.gui';

// If the simulation speed is below this value, a new interval will be created to handle ui rendering
// at a reasonable speed. If it is above, the simulation interval will be used to update the ui.
const min_render_speed = 60;

class Engine {
  constructor() {
    this.fps = 60;

    this.env = new WorldEnvironment(5);

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

  setGUI() {
    const folderColorScheme = this.gui.addFolder("Color Scheme")
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'empty')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'food')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'wall')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'mouth')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'producer')
      .onFinishChange(() => { this.colorSchemeManager.renderColorSchem(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'mover')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'killer')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'armor')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'eye')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme
      .addColor(this.colorSchemeManager.world_env.config.color_scheme, 'eye-slit')
      .onFinishChange(() => { this.colorSchemeManager.renderColorScheme(); });
    folderColorScheme.open();
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
