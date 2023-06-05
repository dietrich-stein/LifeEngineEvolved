declare module 'dat.gui';
declare module '@canvasjs/charts';

type GUI = import('./dat.gui').GUI;

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

type MouthCellClassType = import('./Anatomy/Cells/MouthCell').default;
type BrainCellClassType = import('./Anatomy/Cells/BrainCell').default;
type ProducerCellClassType = import('./Anatomy/Cells/ProducerCell').default;
type MoverCellClassType = import('./Anatomy/Cells/MoverCell').default;
type KillerCellClassType = import('./Anatomy/Cells/KillerCell').default;
type ArmorCellClassType = import('./Anatomy/Cells/ArmorCell').default;
type EyeCellClassType = import('./Anatomy/Cells/EyeCell').default;

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

type AnatomyCellClassType = 
  | MouthCellClassType
  | BrainCellClassType
  | ProducerCellClassType
  | MoverCellClassType
  | KillerCellClassType
  | ArmorCellClassType
  | EyeCellClassType;  

type CellCountsType = {
  mouth: number;
  brain: number;
  producer: number;
  mover: number;
  killer: number;
  armor: number;
  eye: number;
}

type AverageCellCountsType = Array<CellCountsType>;
