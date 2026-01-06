import React, { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { BoardCell } from './BoardCell';
import { GameStatus, StoneType, GameMode } from '@/types/game';
import { BOARD_SIZE } from '@/utils/constants';
import { ForbiddenMoveChecker } from '@/core/ForbiddenChecker';
import { createEmptyBoard } from '@/utils/helpers';
import styles from './Board.module.scss';

export const Board: React.FC<{ isAIThinking?: boolean }> = ({ isAIThinking = false }) => {
  const {
    board: currentBoard,
    makeMove,
    status,
    moveHistory,
    winningStones,
    currentPlayer,
    enableForbidden,
    isReplaying,
    replayStep,
    mode
  } = useGameStore();

  // Instantiate checker (memoized to avoid recreation)
  const forbiddenChecker = useMemo(() => new ForbiddenMoveChecker(), []);

  // Compute Replay Board
  const displayBoard = useMemo(() => {
    if (!isReplaying) return currentBoard;

    const newBoard = createEmptyBoard(BOARD_SIZE);
    // Apply moves up to replayStep
    for (let i = 0; i < replayStep; i++) {
      const move = moveHistory[i];
      newBoard[move.position.row][move.position.col] = move.player;
    }
    return newBoard;
  }, [currentBoard, isReplaying, replayStep, moveHistory]);

  // 缓存禁手位置（性能优化）
  const forbiddenPositions = useMemo(() => {
    if (!enableForbidden || isReplaying || status !== GameStatus.PLAYING || currentPlayer !== StoneType.BLACK) {
      return new Set<string>();
    }

    const forbidden = new Set<string>();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (displayBoard[r][c] === StoneType.EMPTY) {
          const forbiddenType = forbiddenChecker.checkForbidden(displayBoard, r, c);
          if (forbiddenType) {
            forbidden.add(`${r},${c}`);
          }
        }
      }
    }
    return forbidden;
  }, [displayBoard, enableForbidden, isReplaying, status, currentPlayer, forbiddenChecker]);

  // 计算是否可以交互（影响hover效果和点击）
  const canInteract = useMemo(() => {
    if (isReplaying) return false;
    if (status !== GameStatus.PLAYING) return false;
    if (mode === GameMode.PVE) {
      if (isAIThinking) return false;
      if (currentPlayer !== StoneType.BLACK) return false;
    }
    return true;
  }, [isReplaying, status, mode, isAIThinking, currentPlayer]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // 复盘模式下禁止点击
      if (isReplaying) return;

      // 游戏未进行时禁止点击
      if (status !== GameStatus.PLAYING) return;

      // PVE模式下的额外检查
      if (mode === GameMode.PVE) {
        // AI思考中禁止点击
        if (isAIThinking) return;

        // 不是玩家回合（黑棋）时禁止点击
        if (currentPlayer !== StoneType.BLACK) return;
      }

      makeMove({ row, col });
    },
    [makeMove, status, isReplaying, mode, isAIThinking, currentPlayer]
  );

  // 检查是否是获胜棋子 (only show in replay if we are at the last step OR if we implement win check history later)
  // For now, only show win lines if NOT replaying, or if replay is at max step AND game is over
  const showWinningLines = !isReplaying || (replayStep === moveHistory.length && status !== GameStatus.PLAYING);

  const checkIsWinningStone = useCallback((row: number, col: number): boolean => {
    if (!showWinningLines) return false;
    return winningStones.some((pos) => pos.row === row && pos.col === col);
  }, [winningStones, showWinningLines]);

  // 检查是否是最后一步
  const checkIsLastMove = useCallback((row: number, col: number): boolean => {
    if (moveHistory.length === 0) return false;

    // In replay mode, last move is the one at index replayStep - 1
    const targetIndex = isReplaying ? replayStep - 1 : moveHistory.length - 1;
    if (targetIndex < 0) return false;

    const lastMove = moveHistory[targetIndex];
    return lastMove.position.row === row && lastMove.position.col === col;
  }, [moveHistory, isReplaying, replayStep]);

  const currentPlayerColor = currentPlayer === 1 ? 'black' : 'white';

  return (
    <div className={styles.boardContainer}>
      {/* ... (coords) ... */}
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
        {showWinningLines && winningStones.length > 0 && (
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
            {Array.from({ length: BOARD_SIZE }).map((_, col) => {
              // 从缓存中获取禁手状态
              const isForbidden = forbiddenPositions.has(`${row},${col}`);
              const forbiddenType = isForbidden ? forbiddenChecker.checkForbidden(displayBoard, row, col) : null;

              return (
                <BoardCell
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  type={displayBoard[row][col]}
                  status={status}
                  isWinning={checkIsWinningStone(row, col)}
                  isLastMove={checkIsLastMove(row, col)}
                  forbiddenType={forbiddenType}
                  canInteract={canInteract}
                  onClick={handleCellClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
