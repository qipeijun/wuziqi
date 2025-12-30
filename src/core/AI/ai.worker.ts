import { MinimaxAI } from './MinimaxAI';
import { StoneType, AIDifficulty } from '@/types/game';

// Define message types
type WorkerMessage =
  | { type: 'INIT'; difficulty: AIDifficulty }
  | { type: 'GET_MOVE'; board: StoneType[][]; player: StoneType; difficulty?: AIDifficulty };

const ai = new MinimaxAI();

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  switch (type) {
    case 'INIT':
      if (e.data.type === 'INIT') {
        ai.setDifficulty(e.data.difficulty);
      }
      break;

    case 'GET_MOVE':
      if (e.data.type === 'GET_MOVE') {
        const { board, player, difficulty } = e.data;
        if (difficulty) {
          ai.setDifficulty(difficulty);
        }
        const bestMove = ai.getBestMove(board, player);
        self.postMessage(bestMove);
      }
      break;
  }
};
