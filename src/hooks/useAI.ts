import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameMode, GameStatus, StoneType, Position, AIDifficulty } from '@/types/game';

// Define message types for type safety
type WorkerMessage =
  | { type: 'INIT'; difficulty: AIDifficulty }
  | { type: 'GET_MOVE'; board: StoneType[][]; player: StoneType; difficulty?: AIDifficulty };

/**
 * AI Hook
 * 封装AI逻辑，自动在AI回合时触发AI思考
 * 使用 Web Worker 进行计算，避免阻塞 UI
 */
export const useAI = () => {
  const mode = useGameStore((state) => state.mode);
  const status = useGameStore((state) => state.status);
  const currentPlayer = useGameStore((state) => state.currentPlayer);
  const difficulty = useGameStore((state) => state.difficulty);
  const makeMove = useGameStore((state) => state.makeMove);

  // 使用 ref 保存最新的 board 状态
  const boardRef = useRef(useGameStore.getState().board);
  const [isThinking, setIsThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const isExecutingRef = useRef(false);

  // 订阅 board 变化
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (state) => {
        boardRef.current = state.board;
      }
    );
    return unsubscribe;
  }, []);

  // 初始化 Web Worker
  useEffect(() => {
    if (mode === GameMode.PVE) {
      // 创建 Worker
      workerRef.current = new Worker(
        new URL('../core/AI/ai.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // 初始化难度
      workerRef.current.postMessage({
        type: 'INIT',
        difficulty
      } as WorkerMessage);

      // 监听 Worker 消息
      workerRef.current.onmessage = (e: MessageEvent<Position>) => {
        const bestMove = e.data;

        // 稍微延迟一下落子，避免太快
        setTimeout(() => {
          const success = makeMove(bestMove);
          if (!success) {
            console.warn('AI落子失败，位置可能已被占用');
          }
          setIsThinking(false);
          isExecutingRef.current = false;
        }, 500);
      };

      return () => {
        workerRef.current?.terminate();
        workerRef.current = null;
      };
    }
  }, [mode]);

  // 更新难度
  useEffect(() => {
    if (workerRef.current && mode === GameMode.PVE) {
      workerRef.current.postMessage({
        type: 'INIT',
        difficulty
      } as WorkerMessage);
    }
  }, [difficulty, mode]);

  // 监听游戏状态，在AI回合时自动执行
  useEffect(() => {
    if (
      mode === GameMode.PVE &&
      status === GameStatus.PLAYING &&
      currentPlayer === StoneType.WHITE &&
      !isThinking &&
      !isExecutingRef.current &&
      workerRef.current
    ) {
      isExecutingRef.current = true;
      setIsThinking(true);

      // 发送消息给 Worker 开始计算
      workerRef.current.postMessage({
        type: 'GET_MOVE',
        board: boardRef.current,
        player: StoneType.WHITE,
        difficulty
      } as WorkerMessage);
    }
  }, [mode, status, currentPlayer, isThinking, makeMove, difficulty]);

  return { isThinking };
};
