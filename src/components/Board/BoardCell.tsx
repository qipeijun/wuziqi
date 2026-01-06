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
  forbiddenType?: string | null;
  canInteract: boolean; // 是否可以交互
  onClick: (row: number, col: number) => void;
}

const BoardCellComponent: React.FC<BoardCellProps> = ({
  row,
  col,
  type,
  isWinning,
  isLastMove,
  forbiddenType,
  canInteract,
  onClick,
}) => {
  // 检查是否是天元位置（中心点）
  const isTianYuan = row === 7 && col === 7;

  // 检查是否是星位（四个角）
  const isStarPoint = (row === 3 || row === 11) && (col === 3 || col === 11);

  // 可以点击的条件：空位 + 非禁手 + 可交互
  const isClickable = type === StoneType.EMPTY && !forbiddenType && canInteract;

  return (
    <motion.div
      className={`${styles.cell} ${type !== StoneType.EMPTY ? styles.occupied : ''} ${forbiddenType ? styles.forbidden : ''} ${isClickable ? styles.clickable : ''}`}
      onClick={() => isClickable && onClick(row, col)}
      title={forbiddenType || ''}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {/* 天元和星位标记 */}
      {isTianYuan && <div className={styles.tianYuan} />}
      {isStarPoint && <div className={styles.starPoint} />}

      {/* 禁手标记 */}
      {forbiddenType && type === StoneType.EMPTY && (
        <div className={styles.forbiddenMarker}>×</div>
      )}

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
