type PerlinCoordinate = {
  x: number;
  y: number;
}

interface PerlinGradientsInterface {
  [key: string]: PerlinCoordinate;
}

interface PerlinMemoryInterface {
  [key: string]: number;
}

interface PerlinInteface {
  gradients: PerlinGradientsInterface;
  memory: PerlinMemoryInterface;
  reset: () => void;
  rand_vect: () => PerlinCoordinate;
  dot_prod_grid: (x: number, y: number, vx: number, vy: number) => number;
  smootherstep: (x: number) => number;
  interp: (x: number, a: number, b: number) => number;
  get: (x: number, y: number) => number;
}

class Perlin implements PerlinInteface {
  gradients: PerlinGradientsInterface;
  memory: PerlinMemoryInterface;

  constructor() {
    this.gradients = {};
    this.memory = {};
  }

  reset() {
    this.gradients = {};
    this.memory = {};
  }

  rand_vect() {
    let theta = Math.random() * 2 * Math.PI;
    return { 
      x: Math.cos(theta), 
      y: Math.sin(theta) 
    };
  }

  dot_prod_grid(x: number, y: number, vx: number, vy: number) {
    let g_vect;
    let d_vect = { x: x - vx, y: y - vy };
    let coord: string = [vx, vy].toString();
    if (this.gradients[coord]) {
      g_vect = this.gradients[coord];
    } else {
      g_vect = this.rand_vect();
      this.gradients[coord] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  }

  smootherstep(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }

  interp(x: number, a: number, b: number) {
    return a + this.smootherstep(x) * (b - a);
  }

  get(x: number, y: number) {
    let coord: string = [x, y].toString();
    if (this.memory.hasOwnProperty(coord)) {
      return this.memory[coord];
    }
    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = this.dot_prod_grid(x, y, xf, yf);
    let tr = this.dot_prod_grid(x, y, xf + 1, yf);
    let bl = this.dot_prod_grid(x, y, xf, yf + 1);
    let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    let xt = this.interp(x - xf, tl, tr);
    let xb = this.interp(x - xf, bl, br);
    let v = this.interp(y - yf, xt, xb);
    this.memory[coord] = v;
    return v;
  }
}

export default Perlin;
