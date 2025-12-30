import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameMode, AIDifficulty } from '@/types/game';
import styles from './GameMenu.module.scss';

interface GameMenuProps {
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty) => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onStartGame }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.PVP);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>(
    AIDifficulty.MEDIUM
  );

  const handleStart = () => {
    if (selectedMode === GameMode.PVE) {
      onStartGame(selectedMode, selectedDifficulty);
    } else {
      onStartGame(selectedMode);
    }
  };

  return (
    <div className={styles.menuOverlay}>
      <motion.div
        className={styles.menu}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <h2 className={styles.title}>五子棋</h2>

        {/* 游戏模式选择 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>游戏模式</h3>
          <div className={styles.options}>
            <button
              className={`${styles.option} ${
                selectedMode === GameMode.PVP ? styles.selected : ''
              }`}
              onClick={() => setSelectedMode(GameMode.PVP)}
            >
              <span className={styles.optionIcon}>⚔️</span>
              <span className={styles.optionLabel}>双人对战</span>
              <span className={styles.optionDesc}>本地两人对战</span>
            </button>
            <button
              className={`${styles.option} ${
                selectedMode === GameMode.PVE ? styles.selected : ''
              }`}
              onClick={() => setSelectedMode(GameMode.PVE)}
            >
              <span className={styles.optionIcon}>🤖</span>
              <span className={styles.optionLabel}>人机对战</span>
              <span className={styles.optionDesc}>与AI对弈</span>
            </button>
          </div>
        </div>

        {/* AI难度选择（仅在PVE模式下显示） */}
        {selectedMode === GameMode.PVE && (
          <motion.div
            className={styles.section}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className={styles.sectionTitle}>难度</h3>
            <div className={styles.options}>
              <button
                className={`${styles.option} ${styles.small} ${
                  selectedDifficulty === AIDifficulty.EASY ? styles.selected : ''
                }`}
                onClick={() => setSelectedDifficulty(AIDifficulty.EASY)}
              >
                <span className={styles.optionLabel}>简单</span>
              </button>
              <button
                className={`${styles.option} ${styles.small} ${
                  selectedDifficulty === AIDifficulty.MEDIUM ? styles.selected : ''
                }`}
                onClick={() => setSelectedDifficulty(AIDifficulty.MEDIUM)}
              >
                <span className={styles.optionLabel}>中等</span>
              </button>
              <button
                className={`${styles.option} ${styles.small} ${
                  selectedDifficulty === AIDifficulty.HARD ? styles.selected : ''
                }`}
                onClick={() => setSelectedDifficulty(AIDifficulty.HARD)}
              >
                <span className={styles.optionLabel}>困难</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 开始按钮 */}
        <motion.button
          className={styles.startButton}
          onClick={handleStart}
        >
          开始游戏
        </motion.button>
      </motion.div>
    </div>
  );
};
