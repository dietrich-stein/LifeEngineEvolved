interface NeighborsInterface {
  //all: number[][];
  //adjacent: number[][];
  //corners: number[][];
  //allSelf: number[][];
  inRange: (range: number) => number[][];
}

class Neighbors implements NeighborsInterface {
  public static all: number[][];
  public static adjacent: number[][];
  public static corners: number[][];
  public static allSelf: number[][];

  constructor() {
    //all       ...
    //          .x.
    //          ...  
    Neighbors.all = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ];
    //adjacent   .
    //          .x.
    //           .  
    Neighbors.adjacent = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    //corners   . .
    //           x
    //          . .  
    Neighbors.corners = [
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ];
    //allSelf   ...
    //          ...
    //          ...  
    Neighbors.allSelf = [
      [0, 0],
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ];
  }

  inRange(range: number) {
    var neighbors = [];
    for (var i = -range; i <= range; i++) {
      for (var j = -range; j <= range; j++) {
        neighbors.push([i, j]);
      }
    }
    return neighbors;
  }
};

export default Neighbors;
