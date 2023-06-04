import CellStates from '../Anatomy/CellStates';
import Organism from './Organism';

abstract class RandomOrganismGenerator {
  private static organismLayers: number = 4;
  private static cellSpawnChance: number = 0.75;

  public static generate(env: WorldEnvironment) {
    
    var center = env.grid_map.getCenter();
    var organism = new Organism(center[0], center[1], env);
    organism.anatomy.addDefaultCell(CellStates.mouth, 0, 0, true);

    var outermostLayer = RandomOrganismGenerator.organismLayers;
    var x, y;

    // iterate from center to edge of organism
    // layer 0 is the central cell of the organism
    for (var layer = 1; layer <= outermostLayer; layer++) {
      var someCellSpawned = false;
      var spawnChance =
        RandomOrganismGenerator.cellSpawnChance * 1 -
        (layer - 1) / outermostLayer;

      // top
      y = -layer;
      for (x = -layer; x <= layer; x++)
        someCellSpawned = RandomOrganismGenerator.trySpawnCell(
          organism,
          x,
          y,
          spawnChance,
        );

      // bottom
      y = layer;
      for (x = -layer; x <= layer; x++)
        someCellSpawned = RandomOrganismGenerator.trySpawnCell(
          organism,
          x,
          y,
          spawnChance,
        );

      // left
      x = -layer;
      for (y = -layer + 1; y <= layer - 1; y++)
        someCellSpawned = RandomOrganismGenerator.trySpawnCell(
          organism,
          x,
          y,
          spawnChance,
        );

      // right
      x = layer;
      for (y = -layer + 1; y < layer - 1; y++)
        someCellSpawned = RandomOrganismGenerator.trySpawnCell(
          organism,
          x,
          y,
          spawnChance,
        );

      if (!someCellSpawned) break;
    }

    // randomize the organism's brain
    if (organism.brain && organism.brain !== null) {
      organism.brain.randomizeDecisions(true);
    }

    return organism;
  }

  private static trySpawnCell(organism: Organism, x: number, y: number, spawnChance: number) {
    var neighbors = organism.anatomy.getNeighborsOfCell(x, y);
    if (neighbors.length && Math.random() < spawnChance) {
      organism.anatomy.addRandomizedCell(
        CellStates.getRandomLivingType(),
        x,
        y,
        true,
      );
      return true;
    }
    return false;
  }
}



export default RandomOrganismGenerator;
