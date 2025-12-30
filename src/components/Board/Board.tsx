import React, { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { BoardCell } from './BoardCell';
import { GameStatus } from '@/types/game';
import { BOARD_SIZE } from '@/utils/constants';
import styles from './Board.module.scss';

export const Board: React.FC = () => {
  const { board, makeMove, status, moveHistory, winningStones, currentPlayer } = useGameStore();

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (status !== GameStatus.PLAYING) return;
      makeMove({ row, col });
    },
    [makeMove, status]
  );

  // 检查是否是获胜棋子
  const checkIsWinningStone = useCallback((row: number, col: number): boolean => {
    return winningStones.some((pos) => pos.row === row && pos.col === col);
  }, [winningStones]);

  // 检查是否是最后一步
  const checkIsLastMove = useCallback((row: number, col: number): boolean => {
    if (moveHistory.length === 0) return false;
    const lastMove = moveHistory[moveHistory.length - 1];
    return lastMove.position.row === row && lastMove.position.col === col;
  }, [moveHistory]);

  const currentPlayerColor = currentPlayer === 1 ? 'black' : 'white';

  return (
    <div className={styles.boardContainer}>
      {/* 坐标轴 - Top */}
      {Array.from({ length: BOARD_SIZE }).map((_, i) => (
        <div 
          key={`top-${i}`} 
          className={`${styles.coordLabel} ${styles.coordTop}`}
          style={{ left: `calc(30px + ${i} * (100% - 60px) / 15)` }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      
      {/* 坐标轴 - Left */}
      {Array.from({ length: BOARD_SIZE }).map((_, i) => (
        <div 
          key={`left-${i}`} 
          className={`${styles.coordLabel} ${styles.coordLeft}`}
          style={{ top: `calc(30px + ${i} * (100% - 60px) / 15)` }}
        >
          {15 - i}
        </div>
      ))}

      {/* 棋盘背景 */}
      <div className={styles.boardBackground} />

      {/* 棋盘网格 */}
      <div 
        className={styles.board}
        data-player={status === GameStatus.PLAYING ? currentPlayerColor : undefined}
      >
        {/* Win Line Overlay */}
        {winningStones.length > 0 && (
          <svg className={styles.winLineSvg}>
            <line
              x1={`${(winningStones[0].col * 100) / 15 + 100 / 30}%`}
              y1={`${(winningStones[0].row * 100) / 15 + 100 / 30}%`}
              x2={`${(winningStones[winningStones.length - 1].col * 100) / 15 + 100 / 30}%`}
              y2={`${(winningStones[winningStones.length - 1].row * 100) / 15 + 100 / 30}%`}
              className={styles.winLine}
            />
          </svg>
        )}

        {Array.from({ length: BOARD_SIZE }).map((_, row) => (
          <div key={row} className={styles.row}>
            {Array.from({ length: BOARD_SIZE }).map((_, col) => (
              <BoardCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                type={board[row][col]}
                status={status}
                isWinning={checkIsWinningStone(row, col)}
                isLastMove={checkIsLastMove(row, col)}
                onClick={handleCellClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
