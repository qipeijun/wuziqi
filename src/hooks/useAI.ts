import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameMode, GameStatus, StoneType, Position, AIDifficulty } from '@/types/game';

// Define message types for type safety
type WorkerMessage =
  | { type: 'INIT'; difficulty: AIDifficulty; enableForbidden: boolean }
  | { type: 'GET_MOVE'; board: StoneType[][]; player: StoneType; difficulty?: AIDifficulty; enableForbidden?: boolean };

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
  const enableForbidden = useGameStore((state) => state.enableForbidden);
  const makeMove = useGameStore((state) => state.makeMove);

  // 使用 ref 保存最新的 board 状态
  const boardRef = useRef(useGameStore.getState().board);
  const [isThinking, setIsThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const isExecutingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingStartTimeRef = useRef<number>(0); // 记录开始思考的时间

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
        difficulty,
        enableForbidden
      } as WorkerMessage);

      // 监听 Worker 消息
      workerRef.current.onmessage = (e: MessageEvent<{ move: Position, score: number }>) => {
        const { move, score } = e.data;

        // 清除超时定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // 计算已经思考的时间
        const elapsedTime = Date.now() - thinkingStartTimeRef.current;
        const minThinkingTime = 800; // 最小思考时间800ms，让用户看到AI在思考
        const remainingTime = Math.max(0, minThinkingTime - elapsedTime);

        // 如果思考时间太短，延迟一下再落子
        setTimeout(() => {
          // 立即执行落子
          const success = makeMove(move, score);
          if (!success) {
            console.warn('AI落子失败，位置可能已被占用');
          }

          // 落子后立刻停止"思考"状态
          setIsThinking(false);
          isExecutingRef.current = false;
        }, remainingTime);
      };

      // 错误处理
      workerRef.current.onerror = (error) => {
        console.error('AI Worker错误:', error);
        setIsThinking(false);
        isExecutingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        alert('AI计算出错，请重新开始游戏');
      };

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
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
        difficulty,
        enableForbidden
      } as WorkerMessage);
    }
  }, [difficulty, mode, enableForbidden]);

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
      thinkingStartTimeRef.current = Date.now(); // 记录开始时间

      // 设置超时（30秒）
      timeoutRef.current = setTimeout(() => {
        console.error('AI计算超时');
        setIsThinking(false);
        isExecutingRef.current = false;
        alert('AI思考超时，请重新开始游戏');
      }, 30000);

      // 发送消息给 Worker 开始计算
      workerRef.current.postMessage({
        type: 'GET_MOVE',
        board: boardRef.current,
        player: StoneType.WHITE,
        difficulty,
        enableForbidden
      } as WorkerMessage);
    }
  }, [mode, status, currentPlayer, isThinking, makeMove, difficulty, enableForbidden]);

  return { isThinking };
};
