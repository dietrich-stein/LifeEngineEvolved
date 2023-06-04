import Hyperparams from '../../Hyperparams';
import Directions from '../Directions';
import CellStates from '../../Anatomy/CellStates';
import Organism from '../Organism';
import Observation from './Observation';
import Decision from './Decision';

interface DecisionsMapInterface {
  [key: string]: number;
}

interface BrainControllerInterface {
  owner_org: Organism;
  observations: Array<Observation>;
}

class BrainController implements BrainControllerInterface {
  owner_org: Organism;
  observations: Array<Observation>;
  decisions: DecisionsMapInterface;

  constructor(ownerOrganism: Organism) {
    this.owner_org = ownerOrganism;
    this.observations = [];

    // corresponds to CellTypes
    this.decisions = {};
    for (let cell of CellStates.all) {
      this.decisions[cell.name] = Decision.neutral;
    }
    this.decisions[CellStates.food.name] = Decision.chase;
    this.decisions[CellStates.killer.name] = Decision.retreat;
  }

  copy(brain: BrainController) {
    if (brain === null || Object.keys(brain.decisions).length < 1) {
      return;
    }
    for (let dec in brain.decisions) {
      this.decisions[dec] = brain.decisions[dec];
    }
  }

  randomizeDecisions(randomize_all: boolean = false) {
    // randomize the non obvious decisions
    if (randomize_all) {
      this.decisions[CellStates.food.name] = Decision.getRandom();
      this.decisions[CellStates.killer.name] = Decision.getRandom();
      this.decisions[CellStates.brain.name] = Decision.getRandom();
    }
    this.decisions[CellStates.mouth.name] = Decision.getRandom();
    this.decisions[CellStates.producer.name] = Decision.getRandom();
    this.decisions[CellStates.mover.name] = Decision.getRandom();
    this.decisions[CellStates.armor.name] = Decision.getRandom();
    this.decisions[CellStates.eye.name] = Decision.getRandom();
  }

  observe(observation: Observation) {
    this.observations.push(observation);
  }

  decide() {
    var decision = Decision.neutral;
    var closest = Hyperparams.lookRange + 1;
    var move_direction = 0;
    for (var obs of this.observations) {
      if (obs.cell == null || obs.cell.owner_org == this.owner_org) {
        continue;
      }
      if (obs.distance < closest) {
        decision = this.decisions[obs.cell.state.name];
        move_direction = obs.direction;
        closest = obs.distance;
      }
    }
    this.observations = [];
    if (decision == Decision.chase) {
      this.owner_org.changeMovementDirection(move_direction);
      return true;
    } else if (decision == Decision.retreat) {
      this.owner_org.changeMovementDirection(
        Directions.getOppositeDirection(move_direction),
      );
      return true;
    }
    return false;
  }

  mutateDecisions() {
    this.decisions[CellStates.getRandomName()] = Decision.getRandom();
    this.decisions[CellStates.empty.name] = Decision.neutral; // if the empty cell has a decision it gets weird
  }

  serialize() {
    return { decisions: this.decisions };
  }
}

export default BrainController;
