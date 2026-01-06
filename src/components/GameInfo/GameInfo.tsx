import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { StoneType, GameStatus, GameMode } from '@/types/game';
import { soundManager } from '@/utils/sound';
import styles from './GameInfo.module.scss';

export const GameInfo: React.FC<{ isAIThinking?: boolean }> = ({ isAIThinking = false }) => {
  const {
    currentPlayer,
    status,
    blackPlayerName,
    whitePlayerName,
    moveHistory,
    undoMove,
    resetGame,
    startTime,
    mode
  } = useGameStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.getMute());

  useEffect(() => {
    let interval: number;
    if (status === GameStatus.PLAYING && startTime) {
      // Sync with startTime immediately
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      
      interval = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (status === GameStatus.WAITING) {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    soundManager.setMute(newMuted);
    setIsMuted(newMuted);
  };

  const getStatusText = (): string => {
    switch (status) {
      case GameStatus.WAITING:
        return '准备开始';
      case GameStatus.PLAYING:
        // AI思考中显示特殊提示
        if (mode === GameMode.PVE && isAIThinking) {
          return `🤖 AI思考中...`;
        }
        return currentPlayer === StoneType.BLACK
          ? `${blackPlayerName} 的回合`
          : `${whitePlayerName} 的回合`;
      case GameStatus.BLACK_WIN:
        return `🎉 ${blackPlayerName} 获胜！`;
      case GameStatus.WHITE_WIN:
        return `🎉 ${whitePlayerName} 获胜！`;
      case GameStatus.DRAW:
        return '平局';
      default:
        return '';
    }
  };

  return (
    <div className={styles.gameInfo}>
      {/* 游戏标题 */}
      <h1 className={styles.title}>五子棋</h1>

      {/* 游戏状态 */}
      <div className={styles.status}>
        <div
          className={`${styles.indicator} ${
            currentPlayer === StoneType.BLACK ? styles.black : styles.white
          }`}
        />
        <span className={styles.statusText}>{getStatusText()}</span>
      </div>

      {/* 步数统计 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>已下棋数</span>
          <span className={styles.statValue}>{moveHistory.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>游戏时长</span>
          <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={undoMove}
          disabled={moveHistory.length === 0 || status !== GameStatus.PLAYING || isAIThinking}
          title={isAIThinking ? 'AI思考中无法悔棋' : '悔棋 (Ctrl+Z)'}
        >
          悔棋 (Ctrl+Z)
        </button>
        <button className={styles.button} onClick={resetGame}>
          重新开始
        </button>
        <button
          className={styles.button}
          onClick={toggleMute}
          style={{ opacity: isMuted ? 0.6 : 1 }}
        >
          {isMuted ? '🔇 静音' : '🔊 声音开启'}
        </button>
      </div>
    </div>
  );
};
