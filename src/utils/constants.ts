// 游戏常量
export const BOARD_SIZE = 15;
export const WIN_COUNT = 5;

// 棋型分值
export const PATTERN_SCORES = {
  FIVE: 100000,           // 连五（获胜）
  ACTIVE_FOUR: 10000,     // 活四（下一步必胜）
  BLOCKED_FOUR: 1000,     // 冲四
  ACTIVE_THREE: 1000,     // 活三
  BLOCKED_THREE: 100,     // 眠三
  ACTIVE_TWO: 100,        // 活二
  BLOCKED_TWO: 10,        // 眠二
} as const;

// 默认玩家名称
export const DEFAULT_PLAYER_NAMES = {
  BLACK: '黑方',
  WHITE: '白方',
  AI: '电脑',
} as const;
