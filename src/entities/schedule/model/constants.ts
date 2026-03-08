export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const PAIR_SLOTS = [
  { startMin: 9 * 60, endMin: 10 * 60 + 50, periods: [1, 2], label: '1-2교시' },
  {
    startMin: 11 * 60,
    endMin: 12 * 60 + 50,
    periods: [3, 4],
    label: '3-4교시',
  },
  {
    startMin: 13 * 60,
    endMin: 14 * 60 + 50,
    periods: [5, 6],
    label: '5-6교시',
  },
  {
    startMin: 15 * 60,
    endMin: 16 * 60 + 50,
    periods: [7, 8],
    label: '7-8교시',
  },
  {
    startMin: 17 * 60,
    endMin: 18 * 60 + 50,
    periods: [9, 10],
    label: '9-10교시',
  },
  {
    startMin: 19 * 60,
    endMin: 20 * 60 + 50,
    periods: [11, 12],
    label: '11-12교시',
  },
];
