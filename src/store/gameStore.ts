import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  StoneType,
  GameStatus,
  GameMode,
  AIDifficulty,
  Move,
  Position,
} from '@/types/game';
import { WinChecker } from '@/core/WinChecker';
import { BOARD_SIZE, DEFAULT_PLAYER_NAMES } from '@/utils/constants';
import { createEmptyBoard, cloneBoard } from '@/utils/helpers';
import { soundManager } from '@/utils/sound';
import { confetti } from '@/utils/confetti';

interface GameState {
  // 游戏状态
  board: StoneType[][];
  currentPlayer: StoneType;
  status: GameStatus;
  mode: GameMode;
  difficulty: AIDifficulty;

  // 历史记录
  moveHistory: Move[];

  // 获胜棋子位置
  winningStones: Position[];

  // 游戏信息
  blackPlayerName: string;
  whitePlayerName: string;
  startTime: number | null;

  // Actions
  initGame: (mode: GameMode, difficulty?: AIDifficulty) => void;
  makeMove: (position: Position) => boolean;
  undoMove: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: AIDifficulty) => void;
}

const winChecker = new WinChecker();

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        board: createEmptyBoard(BOARD_SIZE),
        currentPlayer: StoneType.BLACK,
        status: GameStatus.WAITING,
        mode: GameMode.PVP,
        difficulty: AIDifficulty.MEDIUM,
        moveHistory: [],
        winningStones: [],
        blackPlayerName: DEFAULT_PLAYER_NAMES.BLACK,
        whitePlayerName: DEFAULT_PLAYER_NAMES.WHITE,
        startTime: null,

        // Actions
        initGame: (mode, difficulty) => {
          set({
            board: createEmptyBoard(BOARD_SIZE),
            currentPlayer: StoneType.BLACK,
            status: GameStatus.PLAYING,
            mode,
            difficulty: difficulty || AIDifficulty.MEDIUM,
            moveHistory: [],
            winningStones: [],
            startTime: Date.now(),
            whitePlayerName:
              mode === GameMode.PVE
                ? DEFAULT_PLAYER_NAMES.AI
                : DEFAULT_PLAYER_NAMES.WHITE,
          });
        },

        makeMove: (position) => {
          const state = get();

          // 验证游戏状态
          if (state.status !== GameStatus.PLAYING) {
            return false;
          }

          // 验证移动合法性
          if (state.board[position.row][position.col] !== StoneType.EMPTY) {
            return false;
          }

          // 复制棋盘（使用工具函数）
          const newBoard = cloneBoard(state.board);
          newBoard[position.row][position.col] = state.currentPlayer;

          // 创建移动记录
          const move: Move = {
            position,
            player: state.currentPlayer,
            timestamp: Date.now(),
            moveNumber: state.moveHistory.length + 1,
          };

          // 检查胜负
          const hasWon = winChecker.checkWin(newBoard, position);
          const isDraw = !hasWon && winChecker.checkDraw(newBoard);

          let newStatus: GameStatus = state.status;
          let winningStones: Position[] = [];

          if (hasWon) {
            newStatus =
              state.currentPlayer === StoneType.BLACK
                ? GameStatus.BLACK_WIN
                : GameStatus.WHITE_WIN;
            winningStones = winChecker.getWinningStones(newBoard, position);
            soundManager.playWinSound();
            confetti.burst();
          } else if (isDraw) {
            newStatus = GameStatus.DRAW;
            soundManager.playButtonSound(); // Simple sound for draw
          } else {
            soundManager.playMoveSound();
          }

          // 更新状态
          set({
            board: newBoard,
            currentPlayer:
              state.currentPlayer === StoneType.BLACK
                ? StoneType.WHITE
                : StoneType.BLACK,
            status: newStatus,
            moveHistory: [...state.moveHistory, move],
            winningStones,
          });

          return true;
        },

        undoMove: () => {
          const state = get();

          if (state.moveHistory.length === 0) return;
          
          soundManager.playButtonSound();

          // 在 PVE 模式下，悔棋需要撤销两步（玩家和AI各一步）
          const stepsToUndo = state.mode === GameMode.PVE ? 2 : 1;
          const actualSteps = Math.min(stepsToUndo, state.moveHistory.length);

          const newHistory = state.moveHistory.slice(0, -actualSteps);
          const newBoard = createEmptyBoard(BOARD_SIZE);

          // 重建棋盘
          newHistory.forEach((move) => {
            newBoard[move.position.row][move.position.col] = move.player;
          });

          // 计算当前玩家
          const currentPlayer =
            newHistory.length % 2 === 0 ? StoneType.BLACK : StoneType.WHITE;

          set({
            board: newBoard,
            moveHistory: newHistory,
            currentPlayer,
            status: GameStatus.PLAYING,
            winningStones: [],
          });
        },

        resetGame: () => {
          set({
            board: createEmptyBoard(BOARD_SIZE),
            currentPlayer: StoneType.BLACK,
            status: GameStatus.WAITING,
            moveHistory: [],
            winningStones: [],
            startTime: null,
          });
        },

        setDifficulty: (difficulty) => {
          set({ difficulty });
        },
      }),
      {
        name: 'gomoku-game-storage',
        partialize: (state) => ({
          difficulty: state.difficulty,
          blackPlayerName: state.blackPlayerName,
          whitePlayerName: state.whitePlayerName,
        }),
      }
    )
  )
);
