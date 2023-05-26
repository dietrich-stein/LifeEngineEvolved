const WorldConfig = {
  headless: false,
  fill_window: true,
  cell_size: 5,
  num_cols: 100,
  num_rows: 100,
  clear_walls_on_reset: false,
  auto_reset: false,
  brush_size: 2,
  color_scheme: {
    // non-living
    empty: '#111111',
    food: '#15DE59',
    wall: '#808080',
    // living
    brain: '#FF00FF',
    mouth: '#FFAA00',
    producer: '#0000FF',
    mover: '#00FFFF',
    killer: '#FF0000',
    armor: '#6600CC',
    eye: '#EEEEEE',
    'eye-slit': '#000000',
  }
};

export default WorldConfig;
