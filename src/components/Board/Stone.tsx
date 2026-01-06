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
      initial={{ scale: 1.5, opacity: 0, y: -20 }} // Drop from above
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15, // Bouncy
        mass: 0.8
      }}
    >
      {/* 最后一步标记 */}
      {isLastMove && <div className={styles.lastMoveMarker} />}
    </motion.div>
  );
};
