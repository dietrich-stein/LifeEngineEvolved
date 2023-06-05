abstract class Neighbors {
  //all       ...
  //          .x.
  //          ...  
  public static all: number[][] = [
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
  public static adjacent: number[][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  //corners   . .
  //           x
  //          . .  
  public static corners: number[][] = [
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
  ];
  //allSelf   ...
  //          ...
  //          ...   
  public static allSelf: number[][] = [
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

  public static inRange(range: number) {
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
