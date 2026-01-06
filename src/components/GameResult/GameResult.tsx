import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GameStatus } from '@/types/game';
import styles from './GameResult.module.scss';

interface GameResultProps {
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({ onRestart, onBackToMenu }) => {
  const { status, startReplay, blackPlayerName, whitePlayerName } = useGameStore();

  const handleReplay = () => {
    startReplay();
  };

  const getTitle = () => {
    if (status === GameStatus.DRAW) return '🤝 平局';
    if (status === GameStatus.BLACK_WIN) return `🏆 ${blackPlayerName} 获胜!`;
    if (status === GameStatus.WHITE_WIN) return `🏆 ${whitePlayerName} 获胜!`;
    return '游戏结束';
  };

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <h2 className={styles.title}>{getTitle()}</h2>
        
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onRestart}>再来一局</button>
          <button className={styles.secondaryButton} onClick={handleReplay}>复盘分析</button>
          <button className={styles.textButton} onClick={onBackToMenu}>返回菜单</button>
        </div>
      </motion.div>
    </div>
  );
};

