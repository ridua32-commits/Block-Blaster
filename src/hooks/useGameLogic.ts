import { useState, useCallback, useEffect } from 'react';
import { Block, BlockColor, GameState, LevelConfig, LevelObjective } from '../types';
import { COLORS, LEVELS } from '../constants';
import confetti from 'canvas-confetti';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useGameLogic() {
  const [state, setState] = useState<GameState | null>(null);
  const [highestLevel, setHighestLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('block-blast-highest-level');
      const val = saved ? parseInt(saved, 10) : 1;
      return isNaN(val) ? 1 : Math.max(1, Math.min(100, val));
    } catch {
      return 1;
    }
  });
  const [selectedBlock, setSelectedBlock] = useState<{r: number, c: number} | null>(null);

  const [persistentData, setPersistentData] = useState<{coins: number, inventory: GameState['inventory'] }>(() => {
    const defaultData = { coins: 100, inventory: { bombs: 3, rockets: 3, colorChanges: 3 } };
    try {
      const saved = localStorage.getItem('block-blast-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation of shape
        if (typeof parsed.coins === 'number' && parsed.inventory) {
          return {
            coins: Math.max(0, parsed.coins),
            inventory: {
              bombs: Math.max(0, parsed.inventory.bombs || 0),
              rockets: Math.max(0, parsed.inventory.rockets || 0),
              colorChanges: Math.max(0, parsed.inventory.colorChanges || 0)
            }
          };
        }
      }
      return defaultData;
    } catch {
      return defaultData;
    }
  });

  useEffect(() => {
    localStorage.setItem('block-blast-highest-level', highestLevel.toString());
  }, [highestLevel]);

  useEffect(() => {
    localStorage.setItem('block-blast-data', JSON.stringify(persistentData));
  }, [persistentData]);

  const initLevel = useCallback((levelId: number) => {
    const config = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    
    const generateInitialGrid = () => {
      let newGrid: (Block | null)[][] = [];
      const rows = config.rows || 7;
      const cols = config.cols || 7;
      do {
        newGrid = Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => ({
            id: generateId(),
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
          }))
        );
      } while (checkAllMatches(newGrid).length > 0);
      return newGrid;
    };

    const newGrid = generateInitialGrid();

    setState({
      level: levelId,
      score: 0,
      moves: config.moves,
      grid: newGrid,
      isGameOver: false,
      isWin: false,
      objectives: config.objectives.map((obj) => ({ ...obj, current: 0 })),
      coins: persistentData.coins,
      inventory: persistentData.inventory,
      activeBooster: null,
    });
    setSelectedBlock(null);
  }, [persistentData]);

  useEffect(() => {
    // Initial coins and inventory setup if needed, but don't auto-start level
  }, []);

  const checkAllMatches = (grid: (Block | null)[][]) => {
    if (!grid || grid.length === 0 || !grid[0]) return [];
    const matches: {r: number, c: number}[] = [];
    const rows = grid.length;
    const cols = grid[0].length;

    // Horizontal
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 2; c++) {
        const color = grid[r][c]?.color;
        if (color && grid[r][c+1]?.color === color && grid[r][c+2]?.color === color) {
          matches.push({r, c}, {r, c: c+1}, {r, c: c+2});
          let nextC = c + 3;
          while(nextC < cols && grid[r][nextC]?.color === color) {
            matches.push({r, c: nextC});
            nextC++;
          }
          c = nextC - 1;
        }
      }
    }

    // Vertical
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows - 2; r++) {
        const color = grid[r][c]?.color;
        if (color && grid[r+1][c]?.color === color && grid[r+2][c]?.color === color) {
          matches.push({r, c}, {r: r+1, c}, {r: r+2, c});
          let nextR = r + 3;
          while(nextR < rows && grid[nextR][c]?.color === color) {
            matches.push({r: nextR, c});
            nextR++;
          }
          r = nextR - 1;
        }
      }
    }

    return Array.from(new Set(matches.map(m => `${m.r}-${m.c}`))).map(s => {
      const [r, c] = s.split('-').map(Number);
      return {r, c};
    });
  };

  const handleBlockClick = (r: number, c: number) => {
    if (!state || state.isGameOver || state.isWin || state.moves <= 0) return;

    // Handle Active Booster
    if (state.activeBooster) {
      applyBoosterEffect(r, c);
      return;
    }

    if (selectedBlock?.r === r && selectedBlock?.c === c) {
      setSelectedBlock(null);
      return;
    }

    if (!selectedBlock) {
      setSelectedBlock({ r, c });
      return;
    }

    const isAdjacent = (Math.abs(selectedBlock.r - r) === 1 && selectedBlock.c === c) ||
                     (Math.abs(selectedBlock.c - c) === 1 && selectedBlock.r === r);

    if (isAdjacent) {
      attemptSwap(selectedBlock, { r, c });
      setSelectedBlock(null);
    } else {
      setSelectedBlock({ r, c });
    }
  };

  const attemptSwap = (b1: {r: number, c: number}, b2: {r: number, c: number}) => {
    setState(prev => {
      if (!prev) return null;
      const newGrid = prev.grid.map(row => [...row]);
      
      const temp = newGrid[b1.r][b1.c];
      newGrid[b1.r][b1.c] = newGrid[b2.r][b2.c];
      newGrid[b2.r][b2.c] = temp;

      const matches = checkAllMatches(newGrid);
      if (matches.length > 0) {
        return processMatches(prev, newGrid, matches);
      } else {
        return prev;
      }
    });
  };

  const processMatches = (prevState: GameState, currentGrid: (Block|null)[][], matches: {r: number, c: number}[]) => {
    let newGrid = currentGrid.map(row => [...row]);
    let scoreGain = 0;
    let finalObjectives = [...prevState.objectives];

    matches.forEach(({r, c}) => {
      const block = newGrid[r][c];
      if (block) {
        finalObjectives = finalObjectives.map(obj => {
          if (obj.type === 'clear_color' && obj.color === block.color) {
            return { ...obj, current: Math.min(obj.target, obj.current + 1) };
          }
          return obj;
        });
        newGrid[r][c] = null;
      }
    });

    scoreGain = matches.length * 20;

    const rows = newGrid.length;
    if (rows === 0) return prevState;
    const cols = newGrid[0].length;
    const config = LEVELS.find(l => l.id === prevState.level) || LEVELS[0];

    for (let c = 0; c < cols; c++) {
      let writeIdx = rows - 1;
      for (let r = rows - 1; r >= 0; r--) {
        if (newGrid[r][c] !== null) {
          newGrid[writeIdx][c] = newGrid[r][c];
          if (writeIdx !== r) newGrid[r][c] = null;
          writeIdx--;
        }
      }
      for (let r = writeIdx; r >= 0; r--) {
        newGrid[r][c] = {
          id: generateId(),
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
        };
      }
    }

    const comboMatches = checkAllMatches(newGrid);
    if (comboMatches.length > 0) {
      return processMatches({ 
        ...prevState, 
        grid: newGrid, 
        score: prevState.score + scoreGain,
        objectives: finalObjectives 
      }, newGrid, comboMatches);
    }

    const nextMoves = prevState.moves - 1;
    const nextScore = prevState.score + scoreGain;

    const allObjectivesMet = finalObjectives.every(obj => {
      if (obj.type === 'clear_color') return obj.current >= obj.target;
      if (obj.type === 'score') return nextScore >= obj.target;
      return true;
    });

    if (allObjectivesMet) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      const nextHighest = Math.max(highestLevel, prevState.level + 1);
      setHighestLevel(nextHighest);
      
      const updatedCoins = prevState.coins + 50;
      setPersistentData(prev => ({ ...prev, coins: updatedCoins }));

      return {
        ...prevState,
        grid: newGrid,
        score: nextScore,
        moves: nextMoves,
        objectives: finalObjectives,
        isWin: true,
        coins: updatedCoins,
      };
    }

    const hasMoves = checkPossibleMoves(newGrid);

    return {
      ...prevState,
      grid: newGrid,
      score: nextScore,
      moves: nextMoves,
      isGameOver: nextMoves <= 0 || (!hasMoves && prevState.inventory.bombs === 0 && prevState.inventory.rockets === 0 && prevState.inventory.colorChanges === 0),
      objectives: finalObjectives,
    };
  };

  const checkPossibleMoves = (grid: (Block | null)[][]) => {
    const rows = grid.length;
    if (rows === 0) return false;
    const cols = grid[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Try horizontal swap
        if (c < cols - 1) {
          const tempGrid = grid.map(row => [...row]);
          const temp = tempGrid[r][c];
          tempGrid[r][c] = tempGrid[r][c+1];
          tempGrid[r][c+1] = temp;
          if (checkAllMatches(tempGrid).length > 0) return true;
        }
        // Try vertical swap
        if (r < rows - 1) {
          const tempGrid = grid.map(row => [...row]);
          const temp = tempGrid[r][c];
          tempGrid[r][c] = tempGrid[r+1][c];
          tempGrid[r+1][c] = temp;
          if (checkAllMatches(tempGrid).length > 0) return true;
        }
      }
    }
    return false;
  };

  const useBooster = (type: 'bomb' | 'rocket' | 'shuffle') => {
    setState(prev => {
      if (!prev) return null;
      
      const prices = { bomb: 150, rocket: 100, shuffle: 50 };
      const invKey = type === 'shuffle' ? 'colorChanges' : (type === 'bomb' ? 'bombs' : 'rockets');
      const hasStock = prev.inventory[invKey] > 0;
      
      if (!hasStock) {
        if (prev.coins >= prices[type]) {
          const newCoins = prev.coins - prices[type];
          const newInventory = { ...prev.inventory, [invKey]: prev.inventory[invKey] + 1 };
          setPersistentData({ coins: newCoins, inventory: newInventory });
          // If it's a targetable booster, activate it after buying. If shuffle, handled below.
          if (type !== 'shuffle') {
            return { ...prev, coins: newCoins, inventory: newInventory, activeBooster: type };
          }
          // For shuffle, we fall through to the logic below but with updated inventory
          return { ...prev, coins: newCoins, inventory: newInventory };
        } else {
          return prev;
        }
      }

      // SHUFFLE is immediate
      if (type === 'shuffle' && prev.inventory.colorChanges > 0) {
        const newGrid = prev.grid.map(row => [...row]);
        const flatBlocks = newGrid.flat().filter(b => b !== null) as Block[];
        const shuffled = [...flatBlocks].sort(() => Math.random() - 0.5);
        
        let idx = 0;
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[0].length; c++) {
            if (newGrid[r][c] !== null) {
              newGrid[r][c] = { ...shuffled[idx++], id: generateId() };
            }
          }
        }
        const updatedInventory = { ...prev.inventory, colorChanges: prev.inventory.colorChanges - 1 };
        setPersistentData(d => ({ ...d, inventory: updatedInventory }));
        
        return {
          ...prev,
          grid: newGrid,
          inventory: updatedInventory
        };
      }

      // Others need targeting
      return { ...prev, activeBooster: prev.activeBooster === type ? null : type };
    });
  };

  const applyBoosterEffect = (r: number, c: number) => {
    setState(prev => {
      if (!prev || !prev.activeBooster) return prev;
      
      const newGrid = prev.grid.map(row => [...row]);
      let scoreGain = 0;
      let finalObjectives = [...prev.objectives];
      const rows = newGrid.length;
      if (rows === 0) return prev;
      const cols = newGrid[0].length;

      if (prev.activeBooster === 'bomb' && prev.inventory.bombs > 0) {
        for (let i = r - 1; i <= r + 1; i++) {
          for (let j = c - 1; j <= c + 1; j++) {
            if (i >= 0 && i < rows && j >= 0 && j < cols) {
              const block = newGrid[i][j];
              if (block) {
                finalObjectives = updateObjectives(finalObjectives, block.color);
                newGrid[i][j] = null;
                scoreGain += 15;
              }
            }
          }
        }
        const updatedInventory = { ...prev.inventory, bombs: prev.inventory.bombs - 1 };
        setPersistentData(d => ({ ...d, inventory: updatedInventory }));

        return applyGravityAndRefill({
          ...prev,
          score: prev.score + scoreGain,
          objectives: finalObjectives,
          inventory: updatedInventory,
          activeBooster: null
        }, newGrid);
      }

      if (prev.activeBooster === 'rocket' && prev.inventory.rockets > 0) {
        // Clear row AND column (Advanced Cross Rocket)
        for (let j = 0; j < cols; j++) {
          const block = newGrid[r][j];
          if (block) {
            finalObjectives = updateObjectives(finalObjectives, block.color);
            newGrid[r][j] = null;
            scoreGain += 10;
          }
        }
        for (let i = 0; i < rows; i++) {
          const block = newGrid[i][c];
          if (block) {
            finalObjectives = updateObjectives(finalObjectives, block.color);
            newGrid[i][c] = null;
            scoreGain += 10;
          }
        }
        const updatedInventory = { ...prev.inventory, rockets: prev.inventory.rockets - 1 };
        setPersistentData(d => ({ ...d, inventory: updatedInventory }));

        return applyGravityAndRefill({
          ...prev,
          score: prev.score + scoreGain,
          objectives: finalObjectives,
          inventory: updatedInventory,
          activeBooster: null
        }, newGrid);
      }

      return prev;
    });
  };

  const updateObjectives = (objs: LevelObjective[], color: BlockColor) => {
    return objs.map(obj => {
      if (obj.type === 'clear_color' && obj.color === color) {
        return { ...obj, current: Math.min(obj.target, obj.current + 1) };
      }
      return obj;
    });
  };

  const applyGravityAndRefill = (state: GameState, grid: (Block | null)[][]): GameState => {
    const newGrid = grid.map(row => [...row]);
    const rows = newGrid.length;
    if (rows === 0) return state;
    const cols = newGrid[0].length;
    const config = LEVELS.find(l => l.id === state.level) || LEVELS[0];

    for (let c = 0; c < cols; c++) {
      let writeIdx = rows - 1;
      for (let r = rows - 1; r >= 0; r--) {
        if (newGrid[r][c] !== null) {
          newGrid[writeIdx][c] = newGrid[r][c];
          if (writeIdx !== r) newGrid[r][c] = null;
          writeIdx--;
        }
      }
      for (let r = writeIdx; r >= 0; r--) {
        newGrid[r][c] = {
          id: generateId(),
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
        };
      }
    }

    const comboMatches = checkAllMatches(newGrid);
    if (comboMatches.length > 0) {
      return processMatches(state, newGrid, comboMatches);
    }

    return { ...state, grid: newGrid };
  };

  const clearGameState = () => {
    setState(null);
    setSelectedBlock(null);
  };

  return {
    state,
    highestLevel,
    handleBlockClick,
    initLevel,
    useBooster,
    selectedBlock,
    clearGameState,
    persistentData
  };
}
