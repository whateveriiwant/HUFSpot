import { Campus } from '@/types/campusType';

export const CAMPUSES: {
  value: Campus;
  emoji: string;
  title: string;
  description: string;
  id: string;
}[] = [
  {
    value: 'H1',
    emoji: '🏛️',
    title: '서울',
    description: '서울캠퍼스',
    id: 'campus-seoul',
  },
  {
    value: 'H2',
    emoji: '🌐',
    title: '글로벌',
    description: '글로벌캠퍼스',
    id: 'campus-global',
  },
];
