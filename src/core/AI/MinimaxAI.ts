import { Position, StoneType, AIDifficulty } from '@/types/game';
import { AIPlayer } from '@/types/ai';
import { Evaluator } from './Evaluator';
import { PatternMatcher } from './PatternMatcher';
import { ForbiddenMoveChecker } from '../ForbiddenChecker';
import { BOARD_SIZE } from '@/utils/constants';
import { cloneBoard, getCenterPosition } from '@/utils/helpers';

/**
 * Minimax算法 + Alpha-Beta剪枝
 * 包含棋型识别和启发式评估
 * 性能优化：移动排序、置换表、候选位置限制
 */
export class MinimaxAI implements AIPlayer {
  private evaluator: Evaluator;
  private patternMatcher: PatternMatcher;
  private forbiddenChecker: ForbiddenMoveChecker;
  private maxDepth: number;
  private searchRadius: number; // 搜索半径优化
  private enableForbidden: boolean = true; // Default true
  private transpositionTable: Map<string, number>; // 置换表缓存

  constructor(difficulty: AIDifficulty = AIDifficulty.MEDIUM) {
    this.evaluator = new Evaluator();
    this.patternMatcher = new PatternMatcher();
    this.forbiddenChecker = new ForbiddenMoveChecker();
    this.transpositionTable = new Map();
    // Initialize with default values to satisfy TypeScript
    this.maxDepth = 2;
    this.searchRadius = 2;
    this.setDifficulty(difficulty);
  }
  
  public setForbidden(enable: boolean) {
    this.enableForbidden = enable;
  }

  public setDifficulty(difficulty: AIDifficulty): void {
    switch (difficulty) {
      case AIDifficulty.EASY:
        this.maxDepth = 2;
        this.searchRadius = 1;
        break;
      case AIDifficulty.MEDIUM:
        this.maxDepth = 2;
        this.searchRadius = 2;
        break;
      case AIDifficulty.HARD:
        this.maxDepth = 3;
        this.searchRadius = 2;
        break;
    }
  }

  /**
   * 获取AI的最佳移动
   */
  public getBestMove(board: StoneType[][], aiPlayer: StoneType): { move: Position, score: number } {
    const startTime = Date.now();

    // 清空置换表（每次新搜索）
    this.transpositionTable.clear();

    // 如果是第一步，下在中心附近
    if (this.isFirstMove(board)) {
      return { move: this.getOpeningMove(), score: 0 };
    }

    // 获取候选位置（只考虑已有棋子周围的位置）
    let candidates = this.getCandidatePositions(board, aiPlayer);

    // 如果局部搜索没有结果（比如棋子周围都被占满或禁手），则全局搜索所有空位
    if (candidates.length === 0) {
      candidates = this.getAllEmptyPositions(board, aiPlayer);
    }

    // 如果还是没有（满盘），返回中心点（虽然会失败，但至少不会崩）
    if (candidates.length === 0) {
      return { move: getCenterPosition(BOARD_SIZE), score: 0 };
    }

    // 先进行威胁检测
    const criticalMove = this.checkCriticalMoves(board, aiPlayer);
    if (criticalMove) {
      console.log(
        `AI找到关键位置: (${criticalMove.row}, ${criticalMove.col}), 耗时: ${Date.now() - startTime}ms`
      );
      return { move: criticalMove, score: 10000 }; // High score for critical move
    }

    // 移动排序：先快速评估每个候选位置，优先搜索好的位置
    const rankedCandidates = this.rankCandidates(board, candidates, aiPlayer);

    // Minimax搜索
    let bestScore = -Infinity;
    let bestMove = rankedCandidates[0];
    let alpha = -Infinity;
    const beta = Infinity;

    for (const candidate of rankedCandidates) {
      // 创建棋盘副本并尝试落子（不修改原始棋盘）
      const boardCopy = cloneBoard(board);
      boardCopy[candidate.row][candidate.col] = aiPlayer;

      const score = this.minimax(
        boardCopy,
        this.maxDepth - 1,
        false,
        alpha,
        beta,
        aiPlayer
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = candidate;
      }

      alpha = Math.max(alpha, score);

      // 如果找到必胜点，立即返回
      if (bestScore >= 100000) {
        break;
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `AI思考完成: (${bestMove.row}, ${bestMove.col}), 分数: ${bestScore}, 耗时: ${elapsed}ms, 候选数: ${candidates.length}`
    );

    return { move: bestMove, score: bestScore };
  }

  /**
   * Minimax算法核心（添加置换表缓存）
   */
  private minimax(
    board: StoneType[][],
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    aiPlayer: StoneType
  ): number {
    // 生成棋盘状态的哈希键
    const boardKey = this.getBoardKey(board);

    // 查找置换表
    const cached = this.transpositionTable.get(boardKey);
    if (cached !== undefined) {
      return cached;
    }

    // 终止条件
    if (depth === 0) {
      const score = this.evaluator.evaluate(board, aiPlayer);
      this.transpositionTable.set(boardKey, score);
      return score;
    }

    const currentPlayer = isMaximizing ? aiPlayer : this.getOpponent(aiPlayer);
    const candidates = this.getCandidatePositions(board, currentPlayer);

    if (candidates.length === 0) {
      const score = this.evaluator.evaluate(board, aiPlayer);
      this.transpositionTable.set(boardKey, score);
      return score;
    }

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const pos of candidates) {
        const boardCopy = cloneBoard(board);
        boardCopy[pos.row][pos.col] = currentPlayer;

        const score = this.minimax(boardCopy, depth - 1, false, alpha, beta, aiPlayer);

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);

        if (beta <= alpha) {
          break;
        }

        if (maxScore >= 100000) {
          break;
        }
      }

      this.transpositionTable.set(boardKey, maxScore);
      return maxScore;
    } else {
      let minScore = Infinity;

      for (const pos of candidates) {
        const boardCopy = cloneBoard(board);
        boardCopy[pos.row][pos.col] = currentPlayer;

        const score = this.minimax(boardCopy, depth - 1, true, alpha, beta, aiPlayer);

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);

        if (beta <= alpha) {
          break;
        }

        if (minScore <= -100000) {
          break;
        }
      }

      this.transpositionTable.set(boardKey, minScore);
      return minScore;
    }
  }

  /**
   * 生成棋盘的哈希键（用于置换表）
   */
  private getBoardKey(board: StoneType[][]): string {
    let key = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        key += board[r][c];
      }
    }
    return key;
  }

  /**
   * 移动排序：快速评估候选位置，返回排序后的列表
   */
  private rankCandidates(board: StoneType[][], candidates: Position[], aiPlayer: StoneType): Position[] {
    const scored = candidates.map(pos => {
      const boardCopy = cloneBoard(board);
      boardCopy[pos.row][pos.col] = aiPlayer;
      const score = this.evaluator.evaluate(boardCopy, aiPlayer);
      return { pos, score };
    });

    // 按分数降序排序
    scored.sort((a, b) => b.score - a.score);

    return scored.map(item => item.pos);
  }

  /**
   * 获取候选位置（性能优化关键）
   * 只考虑已有棋子周围的空位
   */
  private getCandidatePositions(board: StoneType[][], player?: StoneType): Position[] {
    const candidates: Position[] = [];
    const visited = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false));
    const radius = this.searchRadius;

    // 收集所有候选位置及其优先级
    const candidatesWithPriority: Array<{ pos: Position; priority: number }> = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== StoneType.EMPTY) {
          // 在该棋子周围寻找空位
          for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
              const nr = r + dr;
              const nc = c + dc;

              if (
                nr >= 0 &&
                nr < BOARD_SIZE &&
                nc >= 0 &&
                nc < BOARD_SIZE &&
                board[nr][nc] === StoneType.EMPTY &&
                !visited[nr][nc]
              ) {
                // 如果指定了玩家且是黑棋，检查是否禁手 (如果开启了禁手)
                if (this.enableForbidden && player === StoneType.BLACK) {
                  if (this.forbiddenChecker.checkForbidden(board, nr, nc)) {
                    continue; // Skip forbidden moves
                  }
                }

                visited[nr][nc] = true;

                // 计算优先级（距离中心越近优先级越高）
                const centerDist = Math.abs(nr - 7) + Math.abs(nc - 7);
                const priority = 100 - centerDist;

                candidatesWithPriority.push({ pos: { row: nr, col: nc }, priority });
              }
            }
          }
        }
      }
    }

    // 按优先级排序，只返回前12个候选位置（更激进的剪枝）
    candidatesWithPriority.sort((a, b) => b.priority - a.priority);
    return candidatesWithPriority.slice(0, 12).map(c => c.pos);
  }

  /**
   * 检查关键位置（必胜/必防）
   */
  private checkCriticalMoves(
    board: StoneType[][],
    aiPlayer: StoneType
  ): Position | null {
    const opponent = this.getOpponent(aiPlayer);

    // 1. 检查自己是否有必胜点
    const winMove = this.findWinningMove(board, aiPlayer);
    if (winMove) return winMove;

    // 2. 检查对手是否有必胜点（必须阻挡）
    const blockMove = this.findWinningMove(board, opponent);
    if (blockMove) return blockMove;

    // 3. 检查活四（优先级高）
    const activeFourMove = this.findActiveFour(board, aiPlayer);
    if (activeFourMove) return activeFourMove;

    // 4. 阻挡对手活四
    const blockActiveFour = this.findActiveFour(board, opponent);
    if (blockActiveFour) return blockActiveFour;

    return null;
  }

  /**
   * 查找必胜位置（连四或活三）
   */
  private findWinningMove(board: StoneType[][], player: StoneType): Position | null {
    const candidates = this.getCandidatePositions(board, player);

    for (const pos of candidates) {
      // 创建棋盘副本进行测试
      const boardCopy = cloneBoard(board);
      boardCopy[pos.row][pos.col] = player;

      // 检查是否形成五连
      const pattern = this.patternMatcher.analyzePosition(boardCopy, pos, player);
      if (pattern.isFive) {
        return pos;
      }
    }

    return null;
  }

  private findActiveFour(board: StoneType[][], player: StoneType): Position | null {
    const candidates = this.getCandidatePositions(board, player);

    for (const pos of candidates) {
      // 创建棋盘副本进行测试
      const boardCopy = cloneBoard(board);
      boardCopy[pos.row][pos.col] = player;

      const pattern = this.patternMatcher.analyzePosition(boardCopy, pos, player);
      if (pattern.isActiveFour) {
        return pos;
      }
    }

    return null;
  }

  private isFirstMove(board: StoneType[][]): boolean {
    return board.every((row) => row.every((cell) => cell === StoneType.EMPTY));
  }

  private getOpeningMove(): Position {
    // 开局下在中心附近的位置
    return getCenterPosition(BOARD_SIZE);
  }

  private getOpponent(player: StoneType): StoneType {
    return player === StoneType.BLACK ? StoneType.WHITE : StoneType.BLACK;
  }

  private getAllEmptyPositions(board: StoneType[][], player?: StoneType): Position[] {
    const candidates: Position[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === StoneType.EMPTY) {
           if (this.enableForbidden && player === StoneType.BLACK) {
             if (this.forbiddenChecker.checkForbidden(board, r, c)) {
               continue;
             }
           }
           candidates.push({ row: r, col: c });
        }
      }
    }
    return candidates;
  }
}
