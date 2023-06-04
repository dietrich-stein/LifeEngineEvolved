interface ColorSchemeInterface {
  [key: string]: string
}

abstract class WorldConfig {
  public static headless: boolean = false;
  public static fill_window: boolean = true;
  public static cell_size: number = 5;
  public static num_cols: number = 100;
  public static num_rows: number = 100;
  public static num_random_orgs: number = 100;
  public static clear_walls_on_reset: boolean = false;
  public static auto_reset: boolean = false;
  public static brush_size: number = 2;
  public static color_scheme: ColorSchemeInterface = {
    empty: '#111111',
    food: '#15DE59',
    wall: '#808080',
    brain: '#FF00FF',
    mouth: '#FFAA00',
    producer: '#0000FF',
    mover: '#00FFFF',
    killer: '#FF0000',
    armor: '#6600CC',
    eye: '#EEEEEE',
    'eye-slit': '#000000',
  };
};

export default WorldConfig;
