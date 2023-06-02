const Directions = {
  n: 0,
  ne: 1,
  e: 2,
  se: 3,
  s: 4,
  sw: 5,
  w: 6,
  nw: 7,
  scalars: [
    [0, -1], // n
    [1, -1], // ne
    [1, 0], // e
    [1, 1], // se
    [0, 1], // s
    [-1, 1], // sw
    [-1, 0], // w
    [-1, -1], // nw
  ],
  getRandomDirection: function () {
    return Math.floor(Math.random() * 8);
  },
  getRandomScalar: function () {
    return this.scalars[Math.floor(Math.random() * this.scalars.length)];
  },
  getOppositeDirection: function (dir) {
    switch (dir) {
      case this.n:
        return this.s;
      case this.s:
        return this.n;
      case this.e:
        return this.w;
      case this.w:
        return this.e;
      case this.nw:
        return this.se;
      case this.ne:
        return this.sw;
      case this.se:
        return this.nw;
      case this.sw:
        return this.ne;        
    }
  },
  rotateRight: function (dir) {
    dir++;
    if (dir > 7) {
      dir = 0;
    }
    return dir;
  },
  rotateLeft: function (dir) {
    dir--;
    if (dir < 0) {
      dir = 7;
    }
    return dir;
  },
  getAbsoluteDirection(cell) {
    var dir = cell.rotation + cell.direction;
    if (dir > 7) {
      dir -= this.scalars.length;
    }
    return dir;
  }  
};

export default Directions;
