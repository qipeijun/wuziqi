import React from 'react';
import { motion } from 'framer-motion';
import { StoneType, Position } from '@/types/game';
import styles from './Stone.module.scss';

interface StoneProps {
  type: StoneType;
  position: Position;
  isWinning?: boolean;
  isLastMove?: boolean;
}

export const Stone: React.FC<StoneProps> = ({
  type,
  isWinning = false,
  isLastMove = false,
}) => {
  const isBlack = type === StoneType.BLACK;

  return (
    <motion.div
      className={`${styles.stone} ${isBlack ? styles.black : styles.white} ${
        isWinning ? styles.winning : ''
      }`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      {/* 最后一步标记 */}
      {isLastMove && <div className={styles.lastMoveMarker} />}
    </motion.div>
  );
};
