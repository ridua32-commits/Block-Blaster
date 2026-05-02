export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Block {
  id: string;
  color: BlockColor;
  isSpecial?: 'bomb' | 'rocket' | 'shuffle';
}

export interface LevelObjective {
  type: 'clear_color' | 'score' | 'clear_all';
  target: number;
  color?: BlockColor;
  current: number;
}

export interface GameState {
  level: number;
  score: number;
  moves: number;
  grid: (Block | null)[][];
  isGameOver: boolean;
  isWin: boolean;
  objectives: LevelObjective[];
  coins: number;
  inventory: {
    bombs: number;
    rockets: number;
    colorChanges: number;
  };
  activeBooster: 'bomb' | 'rocket' | 'shuffle' | null;
}

export interface LevelConfig {
  id: number;
  rows: number;
  cols: number;
  moves: number;
  targetScore: number;
  objectives: Omit<LevelObjective, 'current'>[];
  colors: BlockColor[];
}
