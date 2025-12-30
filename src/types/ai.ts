import { Position, StoneType } from './game';

// AI接口
export interface AIPlayer {
  getBestMove(board: StoneType[][], aiPlayer: StoneType): Position;
  setDifficulty?(difficulty: string): void;
}

// 棋型分析结果
export interface PatternAnalysis {
  isFive: boolean;
  activeFourCount: number;
  blockedFourCount: number;
  activeThreeCount: number;
  blockedThreeCount: number;
  activeTwoCount: number;
  blockedTwoCount: number;
  isActiveFour: boolean;
}

// 评估分数
export interface EvaluationScore {
  score: number;
  position: Position;
}
