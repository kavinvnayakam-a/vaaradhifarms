"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Trophy, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: 'carrot' | 'tomato' | 'corn' | 'pest';
  speed: number;
}

export function HarvestGame({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('harvest_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const spawnObject = useCallback(() => {
    if (!gameActive) return;
    const types: GameObject['type'][] = ['carrot', 'tomato', 'corn', 'pest'];
    const newObj: GameObject = {
      id: Date.now(),
      x: Math.random() * 80 + 10, // 10% to 90%
      y: -10,
      type: types[Math.floor(Math.random() * types.length)],
      speed: 2 + Math.random() * 3
    };
    setObjects(prev => [...prev, newObj]);
  }, [gameActive]);

  useEffect(() => {
    const interval = setInterval(spawnObject, 1000);
    return () => clearInterval(interval);
  }, [spawnObject]);

  useEffect(() => {
    if (!gameActive) return;
    const gameLoop = setInterval(() => {
      setObjects(prev => {
        const next = prev.map(obj => ({ ...obj, y: obj.y + obj.speed }));
        // Check for missed good objects
        next.forEach(obj => {
          if (obj.y > 100 && obj.type !== 'pest') {
            // Missed a crop
          }
        });
        return next.filter(obj => obj.y < 110);
      });
    }, 50);
    return () => clearInterval(gameLoop);
  }, [gameActive]);

  const handleCollect = (obj: GameObject) => {
    if (!gameActive) return;
    
    if (obj.type === 'pest') {
      setLives(prev => {
        if (prev <= 1) {
          setGameActive(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('harvest_high_score', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    } else {
      setScore(prev => prev + 10);
    }
    setObjects(prev => prev.filter(o => o.id !== obj.id));
  };

  const getEmoji = (type: GameObject['type']) => {
    switch (type) {
      case 'carrot': return '🥕';
      case 'tomato': return '🍅';
      case 'corn': return '🌽';
      case 'pest': return '🐛';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-background rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white/20 h-[70vh] flex flex-col">
        {/* Game Header */}
        <div className="p-8 flex justify-between items-center bg-white/10 border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Vaaradhi Mini-Game</span>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Harvest Dash</h3>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Game Stats */}
        <div className="flex justify-around py-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="font-black text-xl tabular-nums">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500 fill-rose-500" />
            <span className="font-black text-xl tabular-nums">{lives}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-emerald-400" />
            <span className="font-black text-xl tabular-nums">{highScore}</span>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-transparent to-black/20 cursor-crosshair">
          {gameActive ? (
            objects.map(obj => (
              <button
                key={obj.id}
                onClick={() => handleCollect(obj)}
                className="absolute text-4xl select-none transform transition-transform active:scale-150 hover:scale-110"
                style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
              >
                {getEmoji(obj.type)}
              </button>
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
              <h4 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Game Over</h4>
              <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-8">You harvested {score} points!</p>
              <button 
                onClick={() => { setScore(0); setLives(3); setGameActive(true); setObjects([]); }}
                className="px-10 py-4 bg-white text-background rounded-2xl font-black uppercase italic tracking-widest shadow-xl hover:scale-105 transition-all"
              >
                Re-Harvest
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-6 text-center bg-black/20">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            Tap crops to harvest • Avoid bugs 🐛
          </p>
        </div>
      </div>
    </div>
  );
}