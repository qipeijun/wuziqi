import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { generateSGF, downloadSGF } from '@/utils/sgf';
import { useDraggable } from '@/hooks/useDraggable';
import styles from './ReplayControl.module.scss';

export const ReplayControl: React.FC = () => {
  const {
    isReplaying,
    replayStep,
    moveHistory,
    jumpToStep,
    nextStep,
    prevStep,
    exitReplay,
    blackPlayerName,
    whitePlayerName
  } = useGameStore();

  // 拖动功能 - 默认位置：右边缘与菜单右边缘对齐
  const { position, isDragging, dragRef, handleMouseDown, handleTouchStart } = useDraggable({
    x: Math.max(20, window.innerWidth / 2 - 180), // 与菜单右边缘对齐 (菜单宽480px，弹框约420px)
    y: Math.max(100, window.innerHeight * 0.6), // 屏幕中间偏下（60%位置）
  });

  const handleExport = () => {
    const sgf = generateSGF(moveHistory, blackPlayerName, whitePlayerName);
    const filename = `gomoku_${new Date().getTime()}.sgf`;
    downloadSGF(sgf, filename);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isReplaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowUp') jumpToStep(0);
      if (e.key === 'ArrowDown') jumpToStep(moveHistory.length);
      if (e.key === 'Escape') exitReplay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReplaying, prevStep, nextStep, jumpToStep, moveHistory, exitReplay]);

  if (!isReplaying) return null;

  return (
    <motion.div
      ref={dragRef}
      className={styles.replayControl}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div
        className={styles.dragHandle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        title="拖动面板"
      >
        <div className={styles.headerActions}>
          <span className={styles.dragIcon}>⋮⋮</span>
          <button className={styles.iconButton} onClick={handleExport} title="导出棋谱 (SGF)">
            💾
          </button>
          <button className={styles.iconButton} onClick={exitReplay} title="退出复盘">
            ✕
          </button>
        </div>
      </div>

      <div className={styles.title}>复盘模式</div>

      <div className={styles.controls}>
        {/* Win Rate Chart (Mini) */}
        {moveHistory.some(m => m.score !== undefined) && (
          <div className={styles.chartContainer}>
            <svg viewBox={`0 0 ${moveHistory.length} 100`} preserveAspectRatio="none">
              {/* Baseline */}
              <line x1="0" y1="50" x2={moveHistory.length} y2="50" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
              
              {/* Score Line */}
              <polyline
                points={moveHistory.map((m, i) => {
                  // Normalize score: assume range -10000 to 10000 -> 0 to 100
                  // Invert Y because SVG 0 is top
                  let score = m.score || 0;
                  // Clamp
                  score = Math.max(-10000, Math.min(10000, score));
                  const y = 50 - (score / 200); // 50 is center. +10000 -> 0 (top), -10000 -> 100 (bottom)
                  return `${i},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#2383E2"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Current Step Indicator */}
              {replayStep > 0 && replayStep <= moveHistory.length && (
                 <circle 
                   cx={replayStep - 1} 
                   cy={50 - (Math.max(-10000, Math.min(10000, moveHistory[replayStep-1].score || 0)) / 200)} 
                   r="3" 
                   fill="#EB5757" 
                 />
              )}
            </svg>
          </div>
        )}

        <button 
          className={styles.button} 
          onClick={() => jumpToStep(0)}
          disabled={replayStep === 0}
          title="第一步"
        >
          ⏮
        </button>
        <button 
          className={styles.button} 
          onClick={prevStep}
          disabled={replayStep === 0}
          title="上一步 (←)"
        >
          ◀
        </button>
        
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min={0}
            max={moveHistory.length}
            value={replayStep}
            onChange={(e) => jumpToStep(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.stepInfo}>
            {replayStep} / {moveHistory.length}
          </span>
        </div>

        <button 
          className={styles.button} 
          onClick={nextStep}
          disabled={replayStep === moveHistory.length}
          title="下一步 (→)"
        >
          ▶
        </button>
        <button 
          className={styles.button} 
          onClick={() => jumpToStep(moveHistory.length)}
          disabled={replayStep === moveHistory.length}
          title="最后一步"
        >
          ⏭
        </button>
      </div>
    </motion.div>
  );
};
