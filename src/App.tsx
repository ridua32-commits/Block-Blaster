/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameLogic } from './hooks/useGameLogic';
import { COLOR_MAP, LEVELS } from './constants';
import { cn } from './utils';
import { 
  Trophy, 
  Coins, 
  RotateCcw, 
  Play, 
  Bomb, 
  Rocket, 
  Palette,
  ChevronRight,
  Target,
  ArrowLeft,
  Lock,
  Wifi
} from 'lucide-react';

export default function App() {
  const { state, highestLevel, handleBlockClick, initLevel, useBooster, selectedBlock, clearGameState, persistentData } = useGameLogic();
  const [screen, setScreen] = useState<'menu' | 'level_select' | 'playing'>('menu');

  const handleGoToMenu = () => {
    setScreen('menu');
  };

  const handleGoToLevels = () => {
    setScreen('level_select');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 relative">
      <div className="mesh-gradient fixed inset-0 z-0" />

      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center space-y-12"
          >
            <div className="text-center group">
              <motion.h1 
                className="text-6xl sm:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                BLOCK BLAST
              </motion.h1>
              <p className="text-blue-300 font-black tracking-[0.4em] text-[10px] sm:text-xs mt-4 uppercase opacity-60 text-center">Quest Adventure</p>
            </div>

            <div className="flex flex-col gap-4 w-full px-8 max-w-xs">
              <button
                onClick={() => setScreen('level_select')}
                className="glass w-full py-6 rounded-[2.5rem] font-black text-xl hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-3 group border-white/30"
              >
                <Play className="fill-white w-6 h-6 group-hover:rotate-12 transition-transform" />
                PLAY
              </button>
              
              <div className="glass w-full py-4 rounded-2xl flex items-center justify-center gap-3 border-white/10 opacity-80">
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[10px] text-slate-900 font-bold shadow-[0_0_15px_rgba(251,191,36,0.4)]">C</div>
                <span className="font-bold text-lg">{state?.coins ?? persistentData.coins}</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-white/40 text-[9px] font-bold uppercase tracking-widest">
                <Wifi size={10} className="text-emerald-400" />
                <span>Offline Ready</span>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'level_select' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="z-10 w-full max-w-lg space-y-6 px-4"
          >
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setScreen('menu')}
                className="glass p-4 rounded-[1.5rem] hover:bg-white/20 transition-all border-white/10"
              >
                <ArrowLeft size={24} className="text-white" />
              </motion.button>
              
              <div className="flex-grow flex justify-between items-center bg-black/20 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/5">
                <h2 className="text-3xl font-black tracking-tight">LEVELS</h2>
                <div className="flex items-center gap-2 bg-amber-400/20 px-4 py-2 rounded-xl border border-amber-400/20">
                   <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-slate-900 font-bold">C</div>
                   <span className="font-bold text-sm">{state?.coins ?? persistentData.coins}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 xs:grid-cols-4 gap-3 sm:gap-6 overflow-y-auto max-h-[60vh] pr-2 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none">
              {LEVELS.map((level) => {
                const lvl = level.id;
                return (
                  <motion.button
                    key={lvl}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      if (highestLevel >= lvl) {
                        initLevel(lvl);
                        setScreen('playing');
                      }
                    }}
                    className={cn(
                      "glass aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden border-white/10 shrink-0",
                      highestLevel >= lvl ? "border-amber-400/30 bg-white/10 shadow-lg" : "opacity-30 grayscale saturate-0 pointer-events-none"
                    )}
                  >
                    <span className="text-3xl font-black">{lvl}</span>
                    <div className="flex gap-0.5">
                      {highestLevel >= lvl ? (
                        <>
                          <Trophy size={10} className={cn(highestLevel > lvl ? "text-amber-400" : "text-white/10")} />
                          <Trophy size={10} className={cn(highestLevel > lvl ? "text-amber-400" : "text-white/10")} />
                          <Trophy size={10} className={cn(highestLevel > lvl ? "text-amber-400" : "text-white/10")} />
                        </>
                      ) : (
                        <div className="text-white/20 mt-1">
                          <Lock size={12} />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === 'playing' && state && (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="z-10 w-full max-w-md h-screen max-h-screen flex flex-col items-center py-2 pb-8 sm:py-8 overflow-hidden"
          >
            {/* Game Header */}
            <div className="flex items-center gap-3 w-full px-4 mb-1 shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGoToLevels}
                className="glass p-3 rounded-2xl hover:bg-white/20 transition-all border-white/10"
              >
                <ArrowLeft size={20} className="text-white" />
              </motion.button>
              
              <div className="flex-grow flex justify-between items-center bg-black/20 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/5">
                <span className="text-sm font-black tracking-widest text-blue-300 uppercase">Level {state.level}</span>
                <div className="flex items-center gap-2 bg-amber-400/20 px-3 py-1.5 rounded-xl border border-amber-400/20">
                   <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-[7px] text-slate-900 font-bold">C</div>
                   <span className="font-bold text-xs">{state.coins}</span>
                </div>
              </div>
            </div>

            {/* Top Objectives Pill */}
            <div className="w-full flex justify-center px-4 shrink-0">
              <div className="glass w-full max-w-[300px] rounded-[2rem] py-1.5 sm:py-2 px-6 flex flex-col items-center shadow-2xl border-white/20 relative">
                <div className="flex justify-center gap-6 sm:gap-10 items-center">
                  {state.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)]" 
                        style={{ backgroundColor: obj.color ? COLOR_MAP[obj.color] : '#fff' }}
                      />
                      <span className="text-base sm:text-lg font-black text-white drop-shadow-lg">{Math.max(0, obj.target - obj.current)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Board Container */}
            <div className="w-full px-4 flex justify-center items-center flex-grow py-1 relative">
              {state.activeBooster && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
                >
                  <div className="w-full h-full border-4 border-white/20 rounded-[3rem] animate-pulse" />
                  <div className="absolute top-4 glass px-4 py-1 rounded-full text-[10px] font-black text-white shadow-xl">
                    SELECT TARGET
                  </div>
                </motion.div>
              )}
              <div className={cn(
                "glass rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-4 shadow-2xl bg-black/40 border-white/10 w-full max-w-[340px] sm:max-w-[360px] relative z-10 transition-all",
                state.activeBooster && "brightness-125 scale-[1.02] ring-4 ring-white/30"
              )}>
                <div 
                  className="grid gap-1.5 w-full aspect-square"
                  style={{ 
                    gridTemplateColumns: `repeat(${state.grid[0].length}, 1fr)`,
                    gridTemplateRows: `repeat(${state.grid.length}, 1fr)`
                  }}
                >
                  {state.grid.map((row, r) => 
                    row.map((block, c) => (
                      <motion.button
                        layout
                        key={block?.id || `empty-${r}-${c}`}
                        onClick={() => handleBlockClick(r, c)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "relative w-full h-full rounded-[22%] transition-all overflow-hidden",
                          block ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_6px_rgba(0,0,0,0.2)]" : "bg-white/5",
                          selectedBlock?.r === r && selectedBlock?.c === c && "ring-4 ring-white ring-offset-2 ring-offset-slate-900 z-10 scale-110 brightness-125"
                        )}
                        style={{ 
                          backgroundColor: block ? COLOR_MAP[block.color] : 'transparent',
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Boosters Row */}
            <div className="flex justify-center gap-3 sm:gap-4 w-full px-4 mb-2">
              <BoosterButton 
                icon={<Bomb className={cn("w-7 h-7 sm:w-8 sm:h-8", state.activeBooster === 'bomb' ? "text-white" : "text-rose-500")} />} 
                count={state.inventory.bombs} 
                onClick={() => useBooster('bomb')} 
                label="BOMB"
                isActive={state.activeBooster === 'bomb'}
              />
              <BoosterButton 
                icon={<Rocket className={cn("w-7 h-7 sm:w-8 sm:h-8", state.activeBooster === 'rocket' ? "text-white" : "text-sky-400")} />} 
                count={state.inventory.rockets} 
                onClick={() => useBooster('rocket')} 
                label="ROCKET"
                isActive={state.activeBooster === 'rocket'}
              />
              <BoosterButton 
                icon={<Palette className="w-7 h-7 sm:w-8 sm:h-8 text-violet-400" />} 
                count={state.inventory.colorChanges} 
                onClick={() => useBooster('shuffle')} 
                label="SHUFFLE"
              />
            </div>

            {/* Final Stats Row */}
            <div className="grid grid-cols-2 gap-4 w-full px-4 max-w-[360px] shrink-0 pb-2">
              <div className="glass rounded-[2rem] p-3 py-4 flex flex-col items-center justify-center shadow-xl border-white/10">
                 <span className="text-blue-300 uppercase text-[9px] font-black tracking-widest mb-0.5 opacity-80">MOVES</span>
                 <div className="text-2xl font-black text-white">{state.moves}</div>
              </div>
              <div className="glass rounded-[2rem] p-3 py-4 flex flex-col items-center justify-center shadow-xl border-white/10">
                 <span className="text-blue-300 uppercase text-[9px] font-black tracking-widest mb-0.5 opacity-80">SCORE</span>
                 <div className="text-2xl font-black text-white">{state.score.toLocaleString()}</div>
              </div>
            </div>

            {/* Win/Lose Overlay INSIDE Playing Screen to prevent bugs on Menu navigation */}
            <AnimatePresence>
              {(state.isGameOver || state.isWin) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    className="glass max-w-sm w-full rounded-[3.5rem] p-10 text-center space-y-10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-t-white/30"
                  >
                    <div className="relative flex flex-col items-center">
                      {state.isWin ? (
                        <>
                          <motion.div 
                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-24 h-24 glass rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(251,191,36,0.3)] border-amber-400/50"
                          >
                            <Trophy size={48} className="text-amber-400" />
                          </motion.div>
                          <h2 className="text-5xl font-black tracking-tighter mb-2 italic">VICTORY!</h2>
                          <p className="text-white/40 text-xs font-black tracking-[0.3em] uppercase">Cleared Level {state.level}</p>
                        </>
                      ) : (
                        <>
                          <div className="w-24 h-24 glass rounded-full flex items-center justify-center mb-6 border-rose-500/50">
                            <RotateCcw size={48} className="text-rose-500" />
                          </div>
                          <h2 className="text-4xl font-black tracking-tighter mb-2 italic uppercase">Try Again</h2>
                          <p className="text-white/40 text-xs font-black tracking-[0.3em] uppercase">Level {state.level} Failed</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={state.isWin 
                          ? () => state.level < 100 ? initLevel(state.level + 1) : setScreen('level_select')
                          : () => initLevel(state.level)
                        }
                        className={cn(
                          "py-5 rounded-3xl font-black transition-all shadow-xl text-sm uppercase tracking-[0.2em]",
                          state.isWin 
                            ? "bg-amber-400 text-slate-900 border-b-[6px] border-amber-600 hover:bg-amber-300 hover:-translate-y-1 active:translate-y-1 active:border-b-0" 
                            : "bg-white text-slate-900 border-b-[6px] border-slate-300 hover:bg-slate-100 hover:-translate-y-1 active:translate-y-1 active:border-b-0"
                        )}
                      >
                        {state.isWin 
                          ? (state.level < 100 ? 'Next Level' : 'Finish Game') 
                          : 'Retry'}
                      </button>
                      
                      <button
                        onClick={handleGoToLevels}
                        className="glass py-4 rounded-3xl font-black hover:bg-white/20 transition-all uppercase tracking-[0.2em] text-[10px] text-white/60"
                      >
                        Level Select
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BoosterButton({ icon, count, onClick, label, isActive }: { icon: React.ReactNode, count: number, onClick: () => void, label: string, isActive?: boolean }) {
  const prices = { BOMB: 150, ROCKET: 100, SHUFFLE: 50 };
  const price = prices[label as keyof typeof prices];

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 group relative transition-all active:scale-90 h-16 w-16 md:h-24 md:w-24 glass rounded-xl md:rounded-2xl flex flex-col items-center justify-center",
        count <= 0 && "opacity-80 border-amber-400/30",
        isActive && "bg-white/30 border-white ring-2 ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
      )}
    >
      <div className={cn(
        "text-xl md:text-3xl mb-0.5 md:mb-1 transform group-hover:scale-110 transition-transform",
        count <= 0 && "grayscale opacity-50"
      )}>
        {icon}
      </div>
      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80">
        {count <= 0 ? `BUY ${price}` : label}
      </span>
      <div className={cn(
        "absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 rounded-full text-[8px] md:text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-slate-900",
        count > 0 ? "bg-white text-black" : "bg-amber-400 text-slate-900"
      )}>
        {count > 0 ? count : "C"}
      </div>
    </button>
  );
}
