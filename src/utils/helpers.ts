import { StoneType } from '@/types/game';

/**
 * 创建空棋盘
 * @param size 棋盘大小
 * @returns 空棋盘二维数组
 */
export const createEmptyBoard = (size: number): StoneType[][] => {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => StoneType.EMPTY)
  );
};

/**
 * 深拷贝棋盘
 * @param board 原始棋盘
 * @returns 新的棋盘副本
 */
export const cloneBoard = (board: StoneType[][]): StoneType[][] => {
  return board.map((row) => [...row]);
};

/**
 * 检查坐标是否在棋盘范围内
 * @param row 行坐标
 * @param col 列坐标
 * @param size 棋盘大小
 * @returns 是否在范围内
 */
export const isValidPosition = (
  row: number,
  col: number,
  size: number
): boolean => {
  return row >= 0 && row < size && col >= 0 && col < size;
};

/**
 * 获取棋盘中心位置
 * @param size 棋盘大小
 * @returns 中心位置坐标
 */
export const getCenterPosition = (size: number) => {
  const center = Math.floor(size / 2);
  return { row: center, col: center };
};
