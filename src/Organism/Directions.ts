type CardinalDirectionsType = {
  n: number;
  ne: number;
  e: number;
  se: number;
  s: number;
  sw: number;
  w: number;
  nw: number;
}

type ScalarCoordinatesType = Array<Array<number>>;

abstract class Directions {
  public static cardinals: CardinalDirectionsType = {
    n: 0,
    ne: 1,
    e: 2,
    se: 3,
    s: 4,
    sw: 5,
    w: 6,
    nw: 7,
  };

  public static scalars: ScalarCoordinatesType = [
    [0, -1], // n
    [1, -1], // ne
    [1, 0], // e
    [1, 1], // se
    [0, 1], // s
    [-1, 1], // sw
    [-1, 0], // w
    [-1, -1], // nw
  ]; 

  public static getRandomDirection(): number {
    return Math.floor(Math.random() * Directions.scalars.length);
  }  

  public static getRandomScalar(): Array<number> {
    return Directions.scalars[Math.floor(Math.random() * Directions.scalars.length)];
  }

  public static getOppositeDirection(dir: number): number {
    switch (dir) {
      case Directions.cardinals.n:
        return Directions.cardinals.s;
      case Directions.cardinals.s:
        return Directions.cardinals.n;
      case Directions.cardinals.e:
        return Directions.cardinals.w;
      case Directions.cardinals.w:
        return Directions.cardinals.e;
      case Directions.cardinals.nw:
        return Directions.cardinals.se;
      case Directions.cardinals.ne:
        return Directions.cardinals.sw;
      case Directions.cardinals.se:
        return Directions.cardinals.nw;
      case Directions.cardinals.sw:
        return Directions.cardinals.ne;
      default:
        return dir;
    }
  }

  public static rotateRight(dir: number): number {
    dir++;
    if (dir > 7) {
      dir = 0;
    }
    return dir;
  }

  public static rotateLeft(dir: number): number {
    dir--;
    if (dir < 0) {
      dir = 7;
    }
    return dir;
  }
}

export default Directions;
