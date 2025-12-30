import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { StoneType, GameStatus } from '@/types/game';
import { Stone } from './Stone';
import styles from './Board.module.scss';

interface BoardCellProps {
  row: number;
  col: number;
  type: StoneType;
  status: GameStatus;
  isWinning: boolean;
  isLastMove: boolean;
  onClick: (row: number, col: number) => void;
}

const BoardCellComponent: React.FC<BoardCellProps> = ({
  row,
  col,
  type,
  isWinning,
  isLastMove,
  onClick,
}) => {
  // 检查是否是天元位置（中心点）
  const isTianYuan = row === 7 && col === 7;

  // 检查是否是星位（四个角）
  const isStarPoint = (row === 3 || row === 11) && (col === 3 || col === 11);

  return (
    <motion.div
      className={styles.cell}
      onClick={() => onClick(row, col)}
    >
      {/* 天元和星位标记 */}
      {isTianYuan && <div className={styles.tianYuan} />}
      {isStarPoint && <div className={styles.starPoint} />}

      {/* 棋子 */}
      {type !== StoneType.EMPTY && (
        <Stone
          type={type}
          position={{ row, col }}
          isWinning={isWinning}
          isLastMove={isLastMove}
        />
      )}
    </motion.div>
  );
};

export const BoardCell = memo(BoardCellComponent);
