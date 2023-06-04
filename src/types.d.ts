type WorldEnvironment = import('./Environment/WorldEnvironment').default;
type EditorEnvironment = import('./Environment/EditorEnvironment').default;
type CellStates = import('./Anatomy/CellStates').default;
type EmptyState = import('./Anatomy/CellStates').EmptyState;
type FoodState = import('./Anatomy/CellStates').FoodState;
type WallState = import('./Anatomy/CellStates').WallState;
type MouthState = import('./Anatomy/CellStates').MouthState;
type BrainState = import('./Anatomy/CellStates').BrainState;
type ProducerState = import('./Anatomy/CellStates').ProducerState;
type MoverState = import('./Anatomy/CellStates').MoverState;
type KillerState = import('./Anatomy/CellStates').KillerState;
type ArmorState = import('./Anatomy/CellStates').ArmorState;
type EyeState = import('./Anatomy/CellStates').EyeState;

type AnyEnvironmentType = 
  | WorldEnvironment 
  | EditorEnvironment;

type AllCellStatesType = 
  | EmptyState 
  | FoodState 
  | WallState 
  | MouthState
  | BrainState
  | ProducerState
  | MoverState
  | KillerState
  | ArmorState
  | EyeState;

type LivingCellStatesType = 
  | MouthState
  | BrainState
  | ProducerState
  | MoverState
  | KillerState
  | ArmorState
  | EyeState;

type AnatomyCellStatesType = 
  | CellStates.mouth
  | CellStates.brain
  | CellStates.producer
  | CellStates.mover
  | CellStates.killer
  | CellStates.armor 
  | CellStates.eye;
