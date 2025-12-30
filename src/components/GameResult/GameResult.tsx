import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameStatus } from '@/types/game';
import styles from './GameResult.module.scss';

interface GameResultProps {
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({ onRestart, onBackToMenu }) => {
  const { status, blackPlayerName, whitePlayerName, moveHistory, startTime } = useGameStore();
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    if (startTime) {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }
  }, [startTime]);

  if (status === GameStatus.PLAYING || status === GameStatus.WAITING) return null;

  const getResultInfo = () => {
    switch (status) {
      case GameStatus.BLACK_WIN:
        return {
          icon: '⚫️',
          title: `${blackPlayerName} 获胜`,
          subtitle: '执黑先行，势如破竹',
        };
      case GameStatus.WHITE_WIN:
        return {
          icon: '⚪️',
          title: `${whitePlayerName} 获胜`,
          subtitle: '执白后手，运筹帷幄',
        };
      case GameStatus.DRAW:
        return {
          icon: '🤝',
          title: '平局',
          subtitle: '棋逢对手，难分伯仲',
        };
      default:
        return { icon: '', title: '', subtitle: '' };
    }
  };

  const info = getResultInfo();

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>{info.icon}</div>
        <h2 className={styles.title}>{info.title}</h2>
        <p className={styles.subtitle}>{info.subtitle}</p>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>总手数</span>
            <span className={styles.statValue}>{moveHistory.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>用时</span>
            <span className={styles.statValue}>{duration}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onRestart}>
            再来一局
          </button>
          <button className={styles.secondaryButton} onClick={onBackToMenu}>
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
};
