import { BlockColor, LevelConfig } from './types';

export const COLORS: BlockColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export const COLOR_MAP: Record<BlockColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
};

// Original Levels 1-9
const INITIAL_LEVELS: LevelConfig[] = [
  {
    id: 1,
    rows: 8,
    cols: 8,
    moves: 25,
    targetScore: 1000,
    objectives: [
      { type: 'clear_color', color: 'red', target: 20 },
      { type: 'clear_color', color: 'blue', target: 20 },
    ],
    colors: ['red', 'blue', 'green', 'yellow'],
  },
  {
    id: 2,
    rows: 9,
    cols: 7,
    moves: 30,
    targetScore: 2000,
    objectives: [
      { type: 'clear_color', color: 'green', target: 30 },
      { type: 'clear_color', color: 'purple', target: 15 },
    ],
    colors: ['red', 'blue', 'green', 'purple', 'orange'],
  },
  {
    id: 3,
    rows: 8,
    cols: 8,
    moves: 20,
    targetScore: 3000,
    objectives: [
      { type: 'clear_color', color: 'yellow', target: 20 },
      { type: 'clear_color', color: 'purple', target: 20 },
    ],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  },
  {
    id: 4,
    rows: 9,
    cols: 8,
    moves: 25,
    targetScore: 4500,
    objectives: [
      { type: 'clear_color', color: 'red', target: 30 },
      { type: 'clear_color', color: 'blue', target: 30 },
    ],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  },
  {
    id: 5,
    rows: 9,
    cols: 6,
    moves: 15,
    targetScore: 4000,
    objectives: [
      { type: 'clear_color', color: 'orange', target: 25 },
    ],
    colors: ['red', 'blue', 'green', 'orange'],
  },
  {
    id: 6,
    rows: 8,
    cols: 8,
    moves: 40,
    targetScore: 10000,
    objectives: [
      { type: 'score', target: 10000 },
    ],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  },
  {
    id: 7,
    rows: 10,
    cols: 8,
    moves: 30,
    targetScore: 6000,
    objectives: [
      { type: 'clear_color', color: 'green', target: 40 },
      { type: 'clear_color', color: 'purple', target: 20 },
    ],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  },
  {
    id: 8,
    rows: 8,
    cols: 8,
    moves: 20,
    targetScore: 5000,
    objectives: [
      { type: 'clear_color', color: 'yellow', target: 50 },
    ],
    colors: ['yellow', 'purple', 'orange'],
  },
  {
    id: 9,
    rows: 10,
    cols: 10,
    moves: 50,
    targetScore: 20000,
    objectives: [
      { type: 'score', target: 20000 },
      { type: 'clear_color', color: 'red', target: 50 },
    ],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  },
];

// Generate levels 10 to 100
const GENERATED_LEVELS: LevelConfig[] = Array.from({ length: 91 }, (_, i) => {
  const levelId = i + 10;
  const progress = levelId / 100;
  
  // Grid size: 7x7 (early) to 10x10 (late)
  const rows = Math.min(10, 7 + Math.floor(progress * 4));
  const cols = Math.min(10, 7 + Math.floor(progress * 4));
  
  // Moves: Start generous (25-30), scale down to tight (12-15)
  const moves = Math.max(12, 30 - Math.floor(progress * 18));
  
  // Target score
  const targetScore = levelId * 500;
  
  // Objectives
  const numObjectives = levelId < 30 ? 1 : levelId < 60 ? 2 : 3;
  // Use more colors as levels progress
  const colorCount = Math.min(6, 4 + Math.floor(progress * 4));
  const availableColors = COLORS.slice(0, colorCount);
  
  const objectives: LevelConfig['objectives'] = [];
  const selectedColors = [...availableColors].sort(() => Math.random() - 0.5).slice(0, numObjectives);
  
  selectedColors.forEach((color, idx) => {
    // Objective target scales up
    const baseTarget = 15 + Math.floor(progress * 50);
    objectives.push({
      type: 'clear_color',
      color: color as BlockColor,
      target: baseTarget + (idx * 5)
    });
  });

  if (levelId % 10 === 0) {
    objectives.push({ type: 'score', target: targetScore });
  }

  return {
    id: levelId,
    rows,
    cols,
    moves,
    targetScore,
    objectives,
    colors: availableColors as BlockColor[]
  };
});

export const LEVELS: LevelConfig[] = [...INITIAL_LEVELS, ...GENERATED_LEVELS];
