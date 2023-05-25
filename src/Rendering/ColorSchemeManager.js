import CellStates from '../Organism/Cell/CellStates';

// Renderer controls access to a canvas. There is one renderer for each canvas
class ColorSchemeManager {
  constructor(world_env, editor_env) {
    this.world_env = world_env;
    this.editor_env = editor_env;
  }

  renderColorScheme() {
    for (var state of CellStates.all) {
      state.color = this.world_env.config.color_scheme[state.name];
    }
    CellStates.eye.slit_color = this.world_env.config.color_scheme['eye-slit'];

    for (var cell_type in this.world_env.config.color_scheme) {
      $('#' + cell_type + '.cell-type ').css(
        'background-color',
        this.world_env.config.color_scheme[cell_type],
      );
      $('#' + cell_type + '.cell-legend-type').css(
        'background-color',
        this.world_env.config.color_scheme[cell_type],
      );
    }

    this.world_env.renderer.renderFullGrid(this.world_env.grid_map.grid);
    this.editor_env.renderer.renderFullGrid(this.editor_env.grid_map.grid);
  }
}

export default ColorSchemeManager;
