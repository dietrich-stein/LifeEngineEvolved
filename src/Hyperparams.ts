import Neighbors from './Grid/Neighbors';

abstract class Hyperparams {
  public static lifespanMultiplier: number = 100;
  public static foodProdProb: number = 5;

  // @TODO: Improve these for diagonal movement  
  public static killableNeighbors: number[][] = Neighbors.adjacent;
  public static edibleNeighbors: number[][] = Neighbors.adjacent;
  public static growableNeighbors: number[][] = Neighbors.adjacent;

  public static useGlobalMutability: boolean = false;
  public static globalMutability: number = 5;
  public static addProb: number = 33;
  public static changeProb: number = 33;
  public static removeProb: number = 33;
  public static rotationEnabled: boolean = true;
  public static foodBlocksReproduction: boolean = true;
  public static moversCanProduce: boolean = false;
  public static instaKill: boolean = false;
  public static lookRange: number;
  public static seeThroughSelf: boolean = false;
  public static foodDropProb: number = 0;
  public static extraMoverFoodCost: number = 0;

  // @todo: Sigh... json and typescript... mortal enemies
  public static loadJsonObj(obj: any) {
    for (let key in obj) {
      debugger;
      // @todo
      //Hyperparams[key] = obj[key];
    }
  }
};


export default Hyperparams;
