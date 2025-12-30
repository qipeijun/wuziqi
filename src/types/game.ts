// 棋盘坐标
export interface Position {
  row: number;
  col: number;
}

// 棋子类型
export enum StoneType {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

// 游戏模式
export enum GameMode {
  PVP = 'PVP',        // 玩家对玩家
  PVE = 'PVE',        // 玩家对AI
  REPLAY = 'REPLAY',  // 复盘模式
}

// AI难度
export enum AIDifficulty {
  EASY = 'EASY',       // 深度2，简单评估
  MEDIUM = 'MEDIUM',   // 深度3，标准评估
  HARD = 'HARD',       // 深度4，高级评估
}

// 游戏状态
export enum GameStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  BLACK_WIN = 'BLACK_WIN',
  WHITE_WIN = 'WHITE_WIN',
  DRAW = 'DRAW',
}

// 移动记录
export interface Move {
  position: Position;
  player: StoneType;
  timestamp: number;
  moveNumber: number;
}

// 棋局快照
export interface GameSnapshot {
  board: StoneType[][];
  currentPlayer: StoneType;
  moveHistory: Move[];
  status: GameStatus;
  timestamp: number;
}

// 游戏记录（用于复盘）
export interface GameRecord {
  id: string;
  mode: GameMode;
  difficulty?: AIDifficulty;
  moves: Move[];
  result: GameStatus;
  startTime: number;
  endTime: number;
  playerBlack: string;
  playerWhite: string;
}

// 统计数据
export interface Statistics {
  totalGames: number;
  pvpGames: number;
  pveGames: number;
  blackWins: number;
  whiteWins: number;
  draws: number;
  winRate: number;
}
