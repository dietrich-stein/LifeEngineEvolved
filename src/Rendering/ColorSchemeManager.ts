import EditorEnvironment from '../Environment/EditorEnvironment';
import WorldEnvironment from '../Environment/WorldEnvironment';
import CellStates from '../Anatomy/CellStates';
import WorldConfig from '../WorldConfig';

// Renderer controls access to a canvas. There is one renderer for each canvas
class ColorSchemeManager {
  world_env: WorldEnvironment;
  editor_env: EditorEnvironment;

  constructor(world_env: WorldEnvironment, editor_env: EditorEnvironment) {
    this.world_env = world_env;
    this.editor_env = editor_env;
  }

  renderColorScheme() {
    for (var state of CellStates.all) {
      state.color = WorldConfig.color_scheme[state.name];
    }
    // @todo: bring back eyes
    //CellStates.eye.slit_color = WorldConfig.color_scheme['eye-slit'];
    for (var cell_type in WorldConfig.color_scheme) {
      $('#' + cell_type + '.cell-type ').css(
        'background-color',
        WorldConfig.color_scheme[cell_type],
      );
      $('#' + cell_type + '.cell-legend-type').css(
        'background-color',
        WorldConfig.color_scheme[cell_type],
      );
    }

    this.world_env.renderer.renderFullGrid(this.world_env.grid_map.grid);
    this.editor_env.renderer.renderFullGrid(this.editor_env.grid_map.grid);
  }
}

export default ColorSchemeManager;
