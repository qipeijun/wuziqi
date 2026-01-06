import { MinimaxAI } from './MinimaxAI';
import { StoneType, AIDifficulty } from '@/types/game';

// Define message types
type WorkerMessage =
  | { type: 'INIT'; difficulty: AIDifficulty; enableForbidden: boolean }
  | { type: 'GET_MOVE'; board: StoneType[][]; player: StoneType; difficulty?: AIDifficulty; enableForbidden?: boolean };

const ai = new MinimaxAI();
console.log('[Worker] AI Worker initialized and ready');

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  try {
    switch (type) {
      case 'INIT':
        if (e.data.type === 'INIT') {
          ai.setDifficulty(e.data.difficulty);
          ai.setForbidden(e.data.enableForbidden);
          console.log('[Worker] AI configured:', {
            difficulty: e.data.difficulty,
            enableForbidden: e.data.enableForbidden
          });
        }
        break;

      case 'GET_MOVE':
        if (e.data.type === 'GET_MOVE') {
          const startTime = performance.now();
          const { board, player, difficulty, enableForbidden } = e.data;

          if (difficulty !== undefined) {
            ai.setDifficulty(difficulty);
          }
          if (enableForbidden !== undefined) {
            ai.setForbidden(enableForbidden);
          }

          console.log('[Worker] Starting AI calculation...');
          const result = ai.getBestMove(board, player);

          const elapsed = performance.now() - startTime;
          console.log(`[Worker] AI calculation completed in ${elapsed.toFixed(0)}ms`);

          self.postMessage(result);
        }
        break;

      default:
        console.warn('[Worker] Unknown message type:', type);
    }
  } catch (error) {
    console.error('[Worker] Error in AI calculation:', error);
    // 发送错误信息回主线程
    self.postMessage({ error: String(error) });
  }
};

// 添加错误处理
self.onerror = (error) => {
  console.error('[Worker] Worker error:', error);
};

console.log('[Worker] Event handlers registered');
